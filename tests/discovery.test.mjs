import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {createRequire} from "node:module";
import ts from "typescript";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
const require=createRequire(import.meta.url);
let language="en";
const cache=new Map();
function load(file){
 file=path.resolve(file);
 if(cache.has(file)) return cache.get(file).exports;
 const mod={exports:{}};cache.set(file,mod);
 const code=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 function localRequire(id){
  if(id.endsWith("/i18n")||id==="./i18n")return {useLang:()=>({lang:language,setLang(){}})};
  if(id.endsWith(".json"))return JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),"utf8"));
  if(id.startsWith(".")){const base=path.resolve(path.dirname(file),id);return load(fs.existsSync(base+".tsx")?base+".tsx":base+".ts");}
  return require(id);
 }
 vm.runInThisContext("(function(require,module,exports){"+code+"\n})",{filename:file})(localRequire,mod,mod.exports);
 return mod.exports;
}
const data=load("app/tournaments.ts"),ui=load("app/discovery.tsx");
test("every event has exactly one supported region and stable collection number",()=>{
 const ids=new Set();
 for(const t of data.tournaments){assert.notEqual(ui.regionOf(t),"Other");assert(ui.regions.some(r=>r[0]===ui.regionOf(t)));assert(data.visuals[t.id]);assert(!ids.has(data.collectionNumber(t.id)));ids.add(data.collectionNumber(t.id));}
 assert.equal(data.collectionNumber("TRN-2026-AUS-001"),"01");
 for(const country of ["Japan","China","Thailand","Vietnam","South Korea","Singapore"])assert.equal(ui.regionOf({country,region:"Asia"}),"East Asia");
 assert.equal(ui.regionOf({country:"Hungary",region:"Europe"}),"Eastern Europe");
 assert.equal(ui.regionOf({country:"Malta",region:"Europe"}),"Western Europe");
 assert.equal(ui.regionOf({country:"South Africa",region:"Africa"}),"Africa");
});
test("summary cards exclude entry, category, gender, rules, fee and verification details",()=>{
 const t={...data.tournaments[1],name:"Example tournament",entry:["SECRET_ENTRY"],category:["SECRET_CATEGORY"],gender:"SECRET_GENDER",format:"SECRET_FORMAT",notes:"SECRET_NOTES",fee:"SECRET_FEE"};
 for(const lang of ["en","ko"]){language=lang;const html=renderToStaticMarkup(React.createElement(ui.EventCard,{t}));assert(!html.includes("SECRET_"));assert(html.includes(ui.detailHref(t.id)));assert(html.includes("country-flag"));assert(html.includes(lang==="ko"?"접수 마감 날짜":"Registration deadline"));assert(html.includes(lang==="ko"?"미정":"To be announced"));}
});
test("calendar uses descending year/month groups and shared detail links",()=>{
 language="ko";const Page=load("app/calendar/page.tsx").default;
 const html=renderToStaticMarkup(React.createElement(Page));
 assert(html.indexOf("2029")<html.indexOf("2027"));
 for(const t of data.activeTournaments){assert(html.includes(ui.detailHref(t.id)));assert(html.includes(data.collectionNumber(t.id)));}
 assert(html.includes("city-photo"));
});
test("main and archive render in both languages with filters and detail links",()=>{
 for(const lang of ["en","ko"]){language=lang;for(const file of ["app/page.tsx","app/archive/page.tsx"]){const html=renderToStaticMarkup(React.createElement(load(file).default));assert(html.includes("region-tabs"));assert(html.includes("/tournament?id="));assert(!html.includes("modal-wrap"));}}
});
test("all details preserve eligibility, format, fees, sources and stable IDs",()=>{
 const Detail=load("app/tournament/page.tsx").Detail;
 for(const lang of ["en","ko"]){language=lang;for(const t of data.tournaments){const html=renderToStaticMarkup(React.createElement(Detail,{t}));for(const id of ["schedule","eligibility","registration","rules","sources"])assert(html.includes('id="'+id+'"'));assert(html.includes(t.sourceUrl.replaceAll("&","&amp;")));assert(html.includes("#"+data.collectionNumber(t.id)));if(t.format)assert(html.includes(t.format.replaceAll("&","&amp;")));}}
});
test("weekly data: stable numbers, archive split, registration states and photos for every event",()=>{
 const src=JSON.parse(fs.readFileSync("data/tournaments.json","utf8"));
 assert.equal(data.tournaments.length,src.tournaments.length);
 assert.equal(data.dataCheckedAt,src.generated_at);
 // Collection numbers 1-23 are fixed forever.
 assert.equal(data.collectionNumber("TRN-2026-AUS-001"),"01");
 assert.equal(data.collectionNumber("TRN-2026-SVK-EAM-001"),"21");
 assert.equal(data.collectionNumber("TRN-2027-USA-KON-001"),"22");
 assert.equal(data.collectionNumber("TRN-2027-USA-HAW-001"),"23");
 for(const t of data.tournaments)assert.equal(data.archivedTournaments.includes(t),["PAST","CANCELLED"].includes(t.status));
 language="ko";const Detail=load("app/tournament/page.tsx").Detail;
 const pan=data.tournaments.find(t=>t.id==="TRN-2026-AUS-001");
 if(pan.teamStatus==="CLOSED"){const html=renderToStaticMarkup(React.createElement(Detail,{t:pan}));assert(html.includes("팀 접수 기록"));assert(!html.includes("팀 접수 열기"));}
 const barcelona=data.tournaments.find(t=>t.id==="TRN-2027-ESP-001");
 if(barcelona.registrationPhase==="PRE_REGISTRATION"&&barcelona.status==="OPEN")assert(renderToStaticMarkup(React.createElement(Detail,{t:barcelona})).includes("팀 사전등록 열기"));
 for(const t of data.tournaments){const img=data.visuals[t.id].image;assert(img);if(img.startsWith("/"))assert(fs.existsSync("public"+img));}
 for(const lang of ["ko","en"]){language=lang;for(const t of data.tournaments){const card=renderToStaticMarkup(React.createElement(ui.EventCard,{t}));assert(card.includes("city-photo-main"));}}
});
test("date notes are shown as a note, not as a 'needs reconfirmation' warning",()=>{
 const withNote=data.tournaments.find(t=>t.start&&t.dateNote);
 if(!withNote)return;
 language="ko";const Detail=load("app/tournament/page.tsx").Detail;
 assert(renderToStaticMarkup(React.createElement(Detail,{t:withNote})).includes("date-note"));
 assert(!renderToStaticMarkup(React.createElement(ui.EventCard,{t:withNote})).includes("날짜 재확인 필요"));
});
test("What's New lists latest week first",()=>{
 language="ko";const html=renderToStaticMarkup(React.createElement(load("app/whats-new/page.tsx").default));
 const dates=fs.readdirSync("data/changes").map(f=>f.replace(".json","")).sort();
 const latest=dates.at(-1),prev=dates.at(-2);
 assert(html.includes(latest));if(prev)assert(html.indexOf(latest)<html.indexOf(prev));
});
