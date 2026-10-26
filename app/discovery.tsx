"use client";
import {useEffect,useState} from "react";
import {Tournament,visuals,statusKo,statusLabel,collectionNumber,FALLBACK_PHOTO} from "./tournaments";
import {useLang} from "./i18n";

export const regions = [
 ["Eastern Europe","동유럽"],["Western Europe","서유럽"],["North America","북미"],["South America","남미"],
 ["Oceania","오세아니아"],["Central Asia","중앙아시아"],["East Asia","동아시아·동남아"],
 ["South Asia","남아시아"],["West Asia","서아시아"],["Africa","아프리카"],["Other","기타"]
] as const;
const countries:Record<string,string[]> = {
 "Eastern Europe":["Hungary","Poland","Czechia","Czech Republic","Slovakia","Romania","Bulgaria","Ukraine","Moldova","Belarus","Russia","Serbia","Croatia","Slovenia","Bosnia and Herzegovina","Montenegro","Albania","North Macedonia","Kosovo","Estonia","Latvia","Lithuania"],
 "Western Europe":["Spain","Malta","Portugal","France","Germany","Austria","Switzerland","Italy","Greece","United Kingdom","Ireland","Belgium","Netherlands","Luxembourg","Denmark","Sweden","Norway","Finland","Iceland","Cyprus"],
 "North America":["United States","USA","Canada","Mexico","Costa Rica","Panama","Guatemala","Cuba","Jamaica","Puerto Rico","Dominican Republic"],
 "South America":["Argentina","Brazil","Chile","Uruguay","Paraguay","Peru","Bolivia","Ecuador","Colombia","Venezuela","Guyana","Suriname"],
 "Oceania":["Australia","New Zealand","Fiji","Samoa","Papua New Guinea"],
 "Central Asia":["Kazakhstan","Uzbekistan","Kyrgyzstan","Tajikistan","Turkmenistan"],
 "East Asia":["China","Japan","South Korea","Korea","Republic of Korea","North Korea","Taiwan","Hong Kong","Macao","Macau","Mongolia","Singapore","Malaysia","Indonesia","Thailand","Vietnam","Viet Nam","Philippines","Cambodia","Laos","Myanmar","Brunei","Timor-Leste"],
 "South Asia":["India","Pakistan","Bangladesh","Sri Lanka","Nepal","Bhutan","Maldives"],
 "West Asia":["Türkiye","Turkey","Iran","Iraq","Israel","Jordan","Lebanon","United Arab Emirates","Saudi Arabia","Qatar","Bahrain","Kuwait","Oman","Georgia","Armenia","Azerbaijan"],
};
export function regionOf(t:Tournament){if(regions.some(r=>r[0]===t.region))return t.region;return Object.keys(countries).find(r=>countries[r].includes(t.country)) || (t.region==="Africa"||t.country==="South Africa"?"Africa":"Other");}
export function yearOf(t:Tournament){return (t.start||t.eventStart||t.name.match(/20\d{2}/)?.[0]||t.id.match(/20\d{2}/)?.[0]||"").slice(0,4);}
export function dateText(value:string|null,ko:boolean){return value?new Date(value+"T00:00:00Z").toLocaleDateString(ko?"ko-KR":"en-GB",{year:"numeric",month:"short",day:"numeric",timeZone:"UTC"}):ko?"미정":"To be announced";}
export function rangeText(t:Tournament,ko:boolean){const note=ko?visuals[t.id]?.dateNoteKo:t.dateNote;const dates=t.start?dateText(t.start,ko)+(t.end&&t.end!==t.start?" – "+dateText(t.end,ko):""):note?note:yearOf(t)+(ko?" · 세부 일정 미정":" · dates to be announced");return dates+(t.dateNeedsReview?(ko?" · 날짜 재확인 필요":" · Dates need reconfirmation"):"");}
export const detailHref=(id:string)=>"/tournament?id="+encodeURIComponent(id);
export function StatusBadge({t}:{t:Tournament}){const{lang}=useLang();return <span className={"status status-"+t.status.toLowerCase().replaceAll("_","-")}><i className="status-dot"/>{t.registrationPhase==="PRE_REGISTRATION"?(lang==="ko"?"사전등록 중":"Pre-registration open"):t.teamStatus==="CLOSED"&&t.individualStatus==="OPEN"?(lang==="ko"?"개인 접수 마감 임박 · 팀 접수 종료":"Individual closing soon · Team closed"):lang==="ko"?statusKo[t.status]:statusLabel(t.status)}</span>}
export function CityPhoto({t,className=""}:{t:Tournament,className?:string}){
 const{lang}=useLang();const[failed,setFailed]=useState(false);const v=visuals[t.id];const ko=lang==="ko";
 return <div className={"city-photo "+className}><img className="city-photo-main" src={failed?FALLBACK_PHOTO:v.image} alt={ko?v.cityKo+" 도시 전경":t.city+" city view"} loading="lazy" onError={()=>{if(!failed)setFailed(true)}}/><img className="country-flag" src={v.flag} alt={ko?v.countryKo:t.country} loading="lazy" onError={e=>{e.currentTarget.style.display="none"}}/></div>;
}
export function EventCard({t}:{t:Tournament}){const{lang}=useLang();const ko=lang==="ko",v=visuals[t.id];return <a className="event-card summary-card" href={detailHref(t.id)} aria-label={t.name+(ko?" 상세정보":" details")}><CityPhoto t={t}/><div className="card-body"><StatusBadge t={t}/><h3>{t.name}</h3><p className="location">⌖ {ko?v.cityKo+", "+v.countryKo:t.city+", "+t.country}</p><dl className="card-facts"><div><dt>{ko?"수구 경기 일정":"Water polo dates"}</dt><dd>{rangeText(t,ko)}</dd></div><div><dt>{ko?"접수 마감 날짜":"Registration deadline"}</dt><dd>{dateText(t.deadline,ko)}</dd></div></dl><span className="view">{ko?"상세정보 보기":"View details"}<span aria-hidden="true">→</span></span></div></a>}
export function RegionFilter({value,onChange,items}:{value:string,onChange:(v:string)=>void,items:Tournament[]}){const{lang}=useLang();const ko=lang==="ko";return <div className="region-filter"><div className="region-tabs" role="group" aria-label={ko?"지역별 대회":"Tournaments by region"}>{[["all",ko?"전체 지역":"All regions"],...regions.map(([en,kr])=>[en,ko?kr:en])].map(([id,label])=><button key={id} aria-pressed={value===id} className={value===id?"selected":""} onClick={()=>onChange(id)}>{label}<span>{items.filter(t=>id==="all"||regionOf(t)===id).length}</span></button>)}</div><p className="region-help">{ko?"사이트 탐색용 구분입니다. 동아시아는 동남아 포함 · 동유럽은 중부·동부 유럽, 서유럽은 나머지 유럽을 묶습니다.":"Directory groupings: East Asia includes Southeast Asia; Eastern Europe includes Central/Eastern Europe, and Western Europe covers the remaining European countries."}</p></div>}
export function CountUp({value}:{value:number}){const[n,setN]=useState(value);useEffect(()=>{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;let frame=0;const start=performance.now();const tick=(now:number)=>{const p=Math.min((now-start)/550,1);setN(Math.round(value*p));if(p<1)frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame)},[value]);return <strong aria-label={String(value)}>{String(n).padStart(2,"0")}</strong>}
