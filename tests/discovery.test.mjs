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
test("October 26 import: 23 records, stable numbers, new events without photos render",()=>{
 assert.equal(data.tournaments.length,23);
 assert.equal(data.dataCheckedAt,"2026-10-26");
 assert.equal(data.collectionNumber("TRN-2026-AUS-001"),"01");
 assert.equal(data.collectionNumber("TRN-2026-SVK-EAM-001"),"21");
 assert.equal(data.collectionNumber("TRN-2027-USA-KON-001"),"22");
 assert.equal(data.collectionNumber("TRN-2027-USA-HAW-001"),"23");
 const pan=data.tournaments.find(t=>t.id==="TRN-2026-AUS-001");
 assert.equal(pan.teamStatus,"CLOSED");assert.equal(pan.individualStatus,"CLOSED");
 language="ko";const Detail=load("app/tournament/page.tsx").Detail;
 const html=renderToStaticMarkup(React.createElement(Detail,{t:pan}));
 assert(html.includes("팀 접수 기록"));assert(!html.includes("팀 접수 열기"));assert(html.includes("23:59 AEST"));
 const arg=data.tournaments.find(t=>t.id==="TRN-2026-ARG-001");assert.equal(arg.status,"PAST");assert(data.archivedTournaments.includes(arg));
 for(const id of ["TRN-2026-USA-003","TRN-2026-MLT-002","TRN-2027-ESP-002"])assert.equal(data.tournaments.find(t=>t.id===id).status,"UNKNOWN");
 const japan=data.tournaments.find(t=>t.id==="TRN-2027-JPN-WMG-001");
 assert.equal(japan.start,"2027-05-28");assert.equal(japan.eventStart,"2027-05-14");
 const barcelona=data.tournaments.find(t=>t.id==="TRN-2027-ESP-001");assert.equal(barcelona.registrationPhase,"PRE_REGISTRATION");assert(renderToStaticMarkup(React.createElement(Detail,{t:barcelona})).includes("팀 사전등록 열기"));
 for(const t of data.tournaments){assert.equal(t.checked,"2026-10-26");const img=data.visuals[t.id].image;if(img&&img.startsWith("/"))assert(fs.existsSync("public"+img));}
 const kona=data.tournaments.find(t=>t.id==="TRN-2027-USA-KON-001");
 assert.equal(data.visuals[kona.id].image,null);
 for(const lang of ["ko","en"]){language=lang;const card=renderToStaticMarkup(React.createElement(ui.EventCard,{t:kona}));assert(card.includes("photo-unavailable"));assert(!card.includes("<img class=\"city-photo-main\""));assert(card.includes(lang==="ko"?"2027년 3월 말 또는 4월 초":"Late March or early April 2027"));}
});
test("What's New lists latest week first with Korean summaries",()=>{
 language="ko";const html=renderToStaticMarkup(React.createElement(load("app/whats-new/page.tsx").default));
 assert(html.indexOf("2026-10-26")<html.indexOf("2026-10-19"));
 assert(html.includes("Go Play Polo Kona Pier"));assert(html.includes("접수 상태 미확인"));
 for(const id of ["TRN-2027-USA-KON-001","TRN-2026-ARG-001"])assert(html.includes(ui.detailHref(id)));
});
