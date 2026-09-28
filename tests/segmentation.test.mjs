import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';
const output = mkdtempSync(join(tmpdir(),'tessy-segments-'));
mkdirSync(join(output,'lib'));
for (const file of ['segments','geography','representatives','uiHelpers']) {
 const source = readFileSync(new URL(`../src/lib/${file}.ts`,import.meta.url),'utf8');
 writeFileSync(join(output,'lib',`${file}.js`),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText);
}
const require=createRequire(import.meta.url);
const {medicalSegment,matchesSegment,requireCompanySegment,MEDICAL_SEGMENTS}=require(join(output,'lib/segments.js'));
const {matchesGeography,statesInRegion,stateAfterRegionChange}=require(join(output,'lib/geography.js'));
const {buildRepresentativeProfiles}=require(join(output,'lib/representatives.js'));
after(()=>rmSync(output,{recursive:true,force:true}));
test('medical segments are exact and accent insensitive; marketing does not define a specialty',()=>{
 assert.equal(medicalSegment('cirurgia plastica'),'Cirurgia Plástica');
 assert.equal(matchesSegment({segment:'Dermatologia',specialty:'Pediatria'},'Pediatria'),false);
 for(const item of [{specialty:'Estética'},{category:'Workshop'},{category:'Outros'},{}]) assert.equal(matchesSegment(item,'Pediatria'),false);
 assert.equal(matchesSegment({category:'Pediatria'},'Pediatria'),true);
 assert.equal(matchesSegment({segment:'Pediatria'},''),false);
});
test('company cannot publish in an unrelated segment or without an assigned segment',()=>{
 assert.equal(requireCompanySegment({role:'empresa',specialty:'Pediatria'}),'Pediatria');
 assert.throws(()=>requireCompanySegment({role:'empresa',specialty:'Pediatria'},'Dermatologia'));
 assert.throws(()=>requireCompanySegment({role:'empresa'}));
 assert.throws(()=>requireCompanySegment({role:'medico',specialty:'Pediatria'}));
});
test('macroregions and states intersect without substring collisions',()=>{
 assert.equal(matchesGeography(['Sul'],'Sul','PR'),true);
 assert.equal(matchesGeography(['Sul de MG'],'Sul','PR'),false);
 assert.equal(matchesGeography(['Sul de MG'],'Sudeste','MG'),true);
 assert.equal(matchesGeography(['Nacional'],'Sul','SP'),false);
 assert.equal(matchesGeography(['Nacional'],'Sul','RS'),true);
 assert.equal(matchesGeography(['Online'],'Nordeste','CE'),true);
 assert.equal(matchesGeography([],'Sudeste','SP'),false);
 assert.equal(matchesGeography(['SP, RJ'],'Sudeste','RJ'),true);
 assert.deepEqual(statesInRegion('Mato Grosso do Sul'),['ms']);
 assert.equal(stateAfterRegionChange('Sul','SP'),'all');
 assert.equal(stateAfterRegionChange('Sudeste','SP'),'SP');
});
test('representatives from one company retain their own medical audiences',()=>{
 const reps=[{id:'a',companyId:'co',companyName:'Marca',name:'Ana',specialty:'Estética',segment:'Dermatologia',state:'SP'},{id:'b',companyId:'co',companyName:'Marca',name:'Bia',specialty:'Produtos',segment:'Pediatria',state:'PR'}];
 const profiles=buildRepresentativeProfiles([],[],[],[],null,reps);
 const result=profiles.filter(r=>matchesSegment(r,'Pediatria')&&matchesGeography(r.regionKeys,'Sul','PR'));
 assert.deepEqual(result.map(r=>r.id),['b']);
 assert.deepEqual(profiles.filter(r=>matchesSegment(r,'Pediatria')&&matchesGeography(r.regionKeys,'Sudeste','SP')),[]);
});
test('database inherits company segment for legacy RPC inserts and rejects mismatched writes',async()=>{
 const db=new PGlite();
 try {
 await db.exec(`create schema auth; create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
 create table profiles(id uuid primary key,role text,specialty text);
 create table events(id serial primary key,company_id uuid,category text,registered_count integer default 0);
 create table products(id serial primary key,company_id uuid,category text);
 create table courses(id serial primary key,company_id uuid,category text);
 create table representatives(id serial primary key,company_id uuid,specialty text);
 insert into profiles values ('00000000-0000-0000-0000-000000000001','empresa','Pediatria');
 insert into products(company_id,category) values ('00000000-0000-0000-0000-000000000001','Pediatria');
 insert into events(company_id,category) values ('00000000-0000-0000-0000-000000000001','Congresso');`);
 const file=readdirSync(new URL('../supabase/migrations/',import.meta.url)).find(f=>f.endsWith('_medical_segments.sql'));
 const sql=readFileSync(new URL(`../supabase/migrations/${file}`,import.meta.url),'utf8');
 await db.exec(sql);
 assert.equal((await db.query('select segment from products')).rows[0].segment,'Pediatria');
 assert.equal((await db.query('select segment from events')).rows[0].segment,null);
 for(const label of MEDICAL_SEGMENTS) assert.equal((await db.query('select tessy_medical_segment($1) segment',[label])).rows[0].segment,label);
 await db.exec("set test.uid='00000000-0000-0000-0000-000000000001'");
 await db.exec("insert into events(company_id,category) values (auth.uid(),'Congresso')");
 assert.equal((await db.query('select segment from events order by id desc limit 1')).rows[0].segment,'Pediatria');
 await assert.rejects(db.exec("insert into events(company_id,category,segment) values (auth.uid(),'Congresso','Dermatologia')"),/segmento/);
 await assert.rejects(db.exec("insert into products(company_id,category) values (auth.uid(),'Dermatologia')"),/categoria/);
 await assert.rejects(db.exec("update products set category='Dermatologia' where id=1"),/categoria/);
 await db.exec("update events set segment='Pediatria' where id=1");
 await db.exec("set test.uid='00000000-0000-0000-0000-000000000002'");
 await assert.rejects(db.exec("insert into representatives(company_id,specialty) values ('00000000-0000-0000-0000-000000000001','Produtos')"),/proprietária/);
 await db.exec('update events set registered_count=1 where id=1');
 // Idempotent schema application must not overwrite classifications.
 await db.exec(sql);
 assert.equal((await db.query('select segment from events where id=1')).rows[0].segment,'Pediatria');
 } finally { await db.close(); }
});
