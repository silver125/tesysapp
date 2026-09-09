import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

// Compile just the pure modules into an isolated CommonJS directory; no database is contacted.
const output = mkdtempSync(join(tmpdir(), 'tessy-regressions-'));
for (const file of ['representatives', 'uiHelpers', 'commercialConnect', 'leadConnections', 'leadInsert', 'dbSchema']) {
  const source = readFileSync(new URL(`../src/lib/${file}.ts`, import.meta.url), 'utf8');
  const target = join(output, 'lib', `${file}.js`);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText);
}
const require = createRequire(import.meta.url);
const regions = require(join(output, 'lib/representatives.js'));
const { representativeLeadInput, connectWithRepresentative } = require(join(output, 'lib/commercialConnect.js'));
const { groupCompanyContacts } = require(join(output, 'lib/leadConnections.js'));
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
