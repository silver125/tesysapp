import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

// Compile just the pure modules into an isolated CommonJS directory; no database is contacted.
const output = mkdtempSync(join(tmpdir(), 'tessy-regressions-'));
for (const file of ['segments', 'geography', 'representatives', 'uiHelpers', 'commercialConnect', 'leadConnections', 'leadInsert', 'dbSchema', 'persistedUpdates', 'catalogRead']) {
  const source = readFileSync(new URL(`../src/lib/${file}.ts`, import.meta.url), 'utf8');
  const target = join(output, 'lib', `${file}.js`);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText);
}
const require = createRequire(import.meta.url);
const regions = require(join(output, 'lib/representatives.js'));
const { representativeLeadInput, connectWithRepresentative } = require(join(output, 'lib/commercialConnect.js'));
const { groupCompanyContacts, filterLeadsForCatalog } = require(join(output, 'lib/leadConnections.js'));
const { insertLeadResilient } = require(join(output, 'lib/leadInsert.js'));
after(() => rmSync(output, { recursive: true, force: true }));

const rep = (regionKeys) => ({ regionKeys, regionLabel: regionKeys.join(' · '), products: [], events: [], companyName: 'Marca', repLabel: 'Ana', specialty: 'Skincare', bio: '' });

test('UF matching does not confuse SP with Espírito Santo or PA with Paraná', () => {
  assert.equal(regions.matchesRepresentativeRegion(rep(['espirito santo']), 'sp'), false);
  assert.equal(regions.matchesRepresentativeRegion(rep(['parana']), 'pa'), false);
  assert.equal(regions.matchesRepresentativeRegion(rep(['Espírito Santo']), 'es'), true);
  assert.equal(regions.matchesRepresentativeRegion(rep(['Mato Grosso do Sul']), 'mt'), false);
  assert.equal(regions.matchesRepresentativeRegion(rep(['Mato Grosso do Sul']), 'ms'), true);
});
test('coverage supports multiple states and explicitly national service', () => {
  assert.equal(regions.matchesRepresentativeRegion(rep(['SP, RJ']), 'rj'), true);
  assert.equal(regions.matchesRepresentativeRegion(rep(['Nacional']), 'ac'), true);
  assert.equal(regions.matchesRepresentativeRegion(rep([]), 'sp'), false);
  assert.equal(regions.representativeRegionFilters().length, 28);
});
test('a company event does not extend a registered representative service area', () => {
  const profiles = regions.buildRepresentativeProfiles(
    [{ companyId: 'co', companyName: 'Marca', location: 'RJ', category: 'Tecnologias' }], [], [], [], null,
    [{ id: 'rep1', companyId: 'co', companyName: 'Marca', name: 'Ana', state: 'SP' }],
  );
  assert.equal(regions.matchesRepresentativeRegion(profiles[0], 'rj'), false);
  assert.equal(regions.matchesRepresentativeRegion(profiles[0], 'sp'), true);
});
test('search accepts accents, products and city names', () => {
  const profile = { ...rep(['São Paulo']), products: [{ name: 'Sérum facial', category: 'Dermocosméticos' }] };
  assert.equal(regions.matchesRepresentativeSearch(profile, 'sao paulo'), true);
  assert.equal(regions.matchesRepresentativeSearch(profile, 'serum'), true);
  assert.equal(regions.matchesRepresentativeCategory(profile, 'skincare'), true);
  assert.equal(regions.matchesRepresentativeCategory(profile, 'tecnologias'), false);
  assert.equal(regions.matchesRepresentativeCategory({ ...profile, products: [{ listingType: 'partnership' }] }, 'parcerias'), true);
});
test('two representatives from one company produce distinct contact identifiers', () => {
  const a = representativeLeadInput('co', 'Marca', { id: 'rep1', name: 'Ana' });
  const b = representativeLeadInput('co', 'Marca', { id: 'rep2', name: 'Bia' });
  assert.notEqual(a.itemId, b.itemId);
  assert.equal(a.itemName, 'Ana');
  assert.equal(a.companyId, b.companyId);
});
test('connection helper propagates persistence errors rather than reporting success', async () => {
  await assert.rejects(connectWithRepresentative('co', 'Marca', undefined, async () => { throw new Error('offline'); }), /offline/);
});
test('company grouping preserves each representative and the approved row id', () => {
  const base = { companyId: 'co', doctorId: 'doc', itemType: 'company', intent: 'representative_contact' };
  const approved = { ...base, id: 'approved', itemId: 'rep1', connectionStatus: 'approved', createdAt: '2026-01-01' };
  const recent = { ...base, id: 'recent', itemId: 'rep1', connectionStatus: 'none', createdAt: '2026-02-01' };
  const second = { ...base, id: 'second', itemId: 'rep2', connectionStatus: 'requested', createdAt: '2026-03-01' };
  const result = groupCompanyContacts([recent, approved, second]);
  assert.equal(result.length, 2);
  assert.equal(result.find(row => row.itemId === 'rep1').id, 'approved');
  assert.equal(result.find(row => row.itemId === 'rep2').connectionStatus, 'requested');
});
test('legacy insert must not strip doctor, company or representative identifiers', async () => {
  const lead = { id: 'lead', companyId: 'co', doctorId: 'doc', itemType: 'company', itemId: 'rep1', itemName: 'Ana', intent: 'representative_contact' };
  for (const column of ['doctor_id', 'company_id', 'item_id', 'id']) {
    const calls = [];
    const client = { from: () => ({ insert: async payload => { calls.push(payload); return { error: { code: 'PGRST204', message: `Could not find the '${column}' column of 'leads' in the schema cache` } }; } }) };
    const result = await insertLeadResilient(client, lead);
    assert.ok(result.error);
    assert.ok(calls.every(payload => column in payload));
  }
});

const { updateCompanyRecord, eventWebsitePatch, eventCapacityError } = require(join(output, 'lib/persistedUpdates.js'));
const { readCatalogRows, isConfirmedEmptyCatalog } = require(join(output, 'lib/catalogRead.js'));

test('edits require a persisted row, retain owner scope and use the database result', async () => {
  const filters = [];
  const saved = { id: 'event-1', title: 'Normalized by database' };
  const query = { eq: (key, value) => { filters.push([key,value]); return query; }, select: async () => ({data:[saved],error:null}) };
  const client = { from: () => ({ update: () => query }) };
  assert.deepEqual(await updateCompanyRecord(client,'events','event-1','co',{title:'Draft'}),saved);
  assert.deepEqual(filters,[['id','event-1'],['company_id','co']]);
  query.select = async () => ({data:[],error:null});
  await assert.rejects(updateCompanyRecord(client,'events','event-1','co',{}),/permissão/);
  query.select = async () => ({data:null,error:{message:'connection failed'}});
  await assert.rejects(updateCompanyRecord(client,'events','event-1','co',{}),/connection failed/);
});
test('clearing an event website differs from leaving it unchanged', () => {
  assert.deepEqual(eventWebsitePatch(undefined),{});
  assert.deepEqual(eventWebsitePatch('  '),{website:null});
  assert.deepEqual(eventWebsitePatch('https://example.com'),{website:'https://example.com'});
});
test('event capacity rejects zero, fractions and reducing below existing interests', () => {
  for (const input of ['',0,-1,2.5,'NaN','Infinity']) assert.ok(eventCapacityError(input));
  assert.ok(eventCapacityError(4,5));
  assert.equal(eventCapacityError(5,5),'');
});
test('failed catalog reads preserve unknown state instead of triggering empty-platform cleanup', () => {
  const failed = readCatalogRows({data:null,error:{message:'offline'}},row=>row);
  const empty = readCatalogRows({data:[],error:null},row=>row);
  assert.equal(failed,null);
  assert.deepEqual(empty,[]);
  assert.equal(isConfirmedEmptyCatalog([empty,failed,empty]),false);
  assert.equal(isConfirmedEmptyCatalog([empty,empty]),true);
  assert.equal(isConfirmedEmptyCatalog([[{id:'one'}],empty]),false);
});

const { buildWhatsappLink } = require(join(output, 'lib/uiHelpers.js'));
test('WhatsApp links normalize DDD 55, country codes and encoded messages', () => {
  assert.equal(buildWhatsappLink('(11) 99999-9999'), 'https://wa.me/5511999999999');
  assert.equal(buildWhatsappLink('(55) 99999-9999'), 'https://wa.me/5555999999999');
  assert.equal(buildWhatsappLink('+55 (11) 99999-9999'), 'https://wa.me/5511999999999');
  assert.equal(buildWhatsappLink('0055 11 99999-9999'), 'https://wa.me/5511999999999');
  assert.equal(buildWhatsappLink('+1 415 555 2671'), 'https://wa.me/14155552671');
  assert.equal(buildWhatsappLink('5511999999999', 'Olá & oi'), 'https://wa.me/5511999999999?text=Ol%C3%A1%20%26%20oi');
  for (const value of [undefined, '', '123', 'sem telefone', '+55 123']) assert.equal(buildWhatsappLink(value), '');
});

test('invitations follow the visible medical catalog and exclude deleted or unrelated items', () => {
  const base = { companyId: 'co', doctorId: 'doc', connectionStatus: 'requested' };
  const leads = [
    { ...base, id: 'ped-rep', itemType: 'company', itemId: 'rep-ped' },
    { ...base, id: 'derm-rep', itemType: 'company', itemId: 'rep-derm' },
    { ...base, id: 'ped-event', itemType: 'event', itemId: 'event-ped' },
    { ...base, id: 'deleted', itemType: 'event', itemId: 'removed-event' },
    { ...base, id: 'ped-product', itemType: 'product', itemId: 'product-ped' },
    { ...base, id: 'ped-course', itemType: 'course', itemId: 'course-ped' },
    { ...base, id: 'unknown-company', itemType: 'company' },
    { ...base, id: 'wrong-owner', companyId: 'other', itemType: 'company', itemId: 'rep-ped' },
  ];
  const catalog = {
    representatives: [{ id: 'rep-ped', companyId: 'co', registered: true }],
    events: [{ id: 'event-ped', companyId: 'co' }],
    products: [{ id: 'product-ped', companyId: 'co' }],
    courses: [{ id: 'course-ped', companyId: 'co' }],
  };
  assert.deepEqual(filterLeadsForCatalog(leads, catalog).map(l => l.id), ['ped-rep', 'ped-event', 'ped-product', 'ped-course']);
  assert.deepEqual(filterLeadsForCatalog(leads, { events: [], products: [], courses: [], representatives: [] }), []);
  const companyLead = [{ ...base, id: 'company', itemType: 'company' }];
  assert.deepEqual(filterLeadsForCatalog(companyLead, { ...catalog, representatives: [{ id: 'co', companyId: 'co', registered: false }] }), companyLead);
});
