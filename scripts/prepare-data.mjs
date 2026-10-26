// Validates data/ before every build and merges data/changes/*.json for the What's New page.
// If anything is wrong, the build stops here and the live site stays as it was.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`  ✗ ${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`  ! ${where}: ${msg}`);

const STATUS = ["ANNOUNCED", "UPCOMING", "OPEN", "CLOSING_SOON", "CLOSED", "PAST", "CANCELLED"];
const REGIONS = ["Eastern Europe", "Western Europe", "North America", "South America", "Oceania", "Central Asia", "East Asia", "South Asia", "West Asia", "Africa", "Other"];
const CHANGE_TYPES = ["NEW", "REGISTRATION_OPENED", "CLOSING_SOON", "DATE_CHANGED", "REGISTRATION_CLOSED", "PAST", "CANCELLED", "NEEDS_REVIEW", "OTHER"];
const isDate = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v + "T00:00:00Z"));
const isUrl = (v) => typeof v === "string" && /^https?:\/\/\S+$/.test(v);
const isText = (v) => typeof v === "string" && v.trim().length > 0;
const optText = (v) => v === null || v === undefined || typeof v === "string";
const optArr = (v) => v === null || (Array.isArray(v) && v.every((x) => typeof x === "string"));

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    err(path.relative(root, file), `JSON을 읽을 수 없습니다 (${e.message})`);
    return null;
  }
}

// ---- tournaments.json ----
const dataFile = path.join(root, "data/tournaments.json");
const data = readJson(dataFile);
const ids = new Set();
if (data) {
  if (!isDate(data.generated_at)) err("tournaments.json", "generated_at 이 YYYY-MM-DD 날짜가 아닙니다");
  if (!Array.isArray(data.tournaments) || data.tournaments.length === 0) err("tournaments.json", "tournaments 배열이 비어 있습니다");
  const numbers = new Set();
  for (const [i, t] of (data.tournaments || []).entries()) {
    const id = t.tournament_id;
    const at = isText(id) ? id : `tournaments[${i}]`;
    if (!/^TRN-\d{4}-[A-Z0-9-]+$/.test(id || "")) err(at, "tournament_id 형식이 TRN-YYYY-... 가 아닙니다");
    if (ids.has(id)) err(at, "tournament_id 가 중복됩니다");
    ids.add(id);
    for (const f of ["name", "country", "city", "organizer"]) if (!isText(t[f])) err(at, `${f} 가 비어 있습니다`);
    if (!Number.isInteger(t.collection_no) || t.collection_no < 1) err(at, "collection_no 가 1 이상의 정수가 아닙니다");
    else if (numbers.has(t.collection_no)) err(at, `collection_no ${t.collection_no} 가 다른 대회와 중복됩니다`);
    else numbers.add(t.collection_no);
    if (!/^[a-z]{2}$/.test(t.country_code || "")) err(at, "country_code 가 소문자 2글자 국가코드(예: us, jp)가 아닙니다");
    if (!REGIONS.includes(t.region)) err(at, `region 값 "${t.region}" 은 허용 목록에 없습니다 (${REGIONS.join(", ")})`);
    if (t.registration_status !== null && !STATUS.includes(t.registration_status)) err(at, `registration_status 값 "${t.registration_status}" 은 허용되지 않습니다`);
    for (const f of ["start_date", "end_date", "water_polo_start_date", "water_polo_end_date", "registration_open_date", "registration_deadline", "team_registration_deadline", "individual_registration_deadline"])
      if (t[f] !== null && t[f] !== undefined && !isDate(t[f])) err(at, `${f} 값 "${t[f]}" 이 YYYY-MM-DD 형식이 아닙니다`);
    if (isDate(t.water_polo_start_date) && isDate(t.water_polo_end_date) && t.water_polo_start_date > t.water_polo_end_date) err(at, "수구 시작일이 종료일보다 늦습니다");
    if (!isDate(t.last_verified_at)) err(at, "last_verified_at 이 날짜가 아닙니다");
    if (!isUrl(t.official_url)) err(at, "official_url 이 URL이 아닙니다");
    if (t.source_url !== null && !isUrl(t.source_url)) err(at, "source_url 이 URL이 아닙니다");
    for (const f of ["entry_type", "category", "gender"]) if (!optArr(t[f])) err(at, `${f} 는 문자열 배열 또는 null 이어야 합니다`);
    if (!["VERIFIED", "PARTIAL", "NEEDS_REVIEW"].includes(t.verification_status)) err(at, `verification_status 값 "${t.verification_status}" 이 허용되지 않습니다`);
    // Korean block
    const ko = t.ko;
    if (!ko || typeof ko !== "object") err(at, "ko (한국어 정보) 가 없습니다");
    else {
      for (const f of ["city", "country", "notes"]) if (!isText(ko[f])) err(at, `ko.${f} 가 비어 있습니다`);
      for (const f of ["registration", "format", "date_note"]) if (!optText(ko[f])) err(at, `ko.${f} 는 문자열 또는 null 이어야 합니다`);
    }
    // Photo
    const v = t.visual;
    if (v === null || v === undefined) warn(at, "visual(도시 사진)이 없어 기본 배경으로 표시됩니다");
    else if (typeof v !== "object") err(at, "visual 은 객체 또는 null 이어야 합니다");
    else {
      if (typeof v.image_url !== "string" || !(v.image_url.startsWith("/") || isUrl(v.image_url))) err(at, "visual.image_url 이 URL 또는 /로 시작하는 경로가 아닙니다");
      else if (v.image_url.startsWith("/") && !fs.existsSync(path.join(root, "public", v.image_url))) err(at, `visual.image_url 파일 public${v.image_url} 이 없습니다`);
      else if (isUrl(v.image_url) && !/^https:\/\/(upload\.wikimedia\.org|commons\.wikimedia\.org)\//.test(v.image_url)) warn(at, "사진이 Wikimedia Commons 외부 사이트에서 불러와집니다 (저작권·링크 깨짐 위험)");
      if (v.source_page !== null && v.source_page !== undefined && !isUrl(v.source_page)) err(at, "visual.source_page 가 URL이 아닙니다");
    }
    // Sanity checks that don't block the build
    const today = data.generated_at;
    if (["OPEN", "CLOSING_SOON"].includes(t.registration_status) && isDate(t.registration_deadline) && t.registration_deadline < today) warn(at, `접수 중으로 표시됐지만 마감일 ${t.registration_deadline} 이 지났습니다`);
    if (t.registration_status !== "PAST" && t.registration_status !== "CANCELLED" && isDate(t.water_polo_end_date) && t.water_polo_end_date < today) warn(at, `경기 종료일 ${t.water_polo_end_date} 이 지났지만 PAST 가 아닙니다`);
  }
}

// ---- changes/*.json ----
const changesDir = path.join(root, "data/changes");
const merged = [];
for (const name of fs.existsSync(changesDir) ? fs.readdirSync(changesDir).filter((f) => f.endsWith(".json")).sort() : []) {
  const file = path.join(changesDir, name);
  const at = "changes/" + name;
  const c = readJson(file);
  if (!c) continue;
  if (!/^\d{4}-\d{2}-\d{2}\.json$/.test(name)) err(at, "파일 이름은 YYYY-MM-DD.json 이어야 합니다");
  if (c.generated_at !== name.replace(/\.json$/, "")) err(at, `generated_at(${c.generated_at}) 이 파일 이름 날짜와 다릅니다`);
  if (!Array.isArray(c.changes)) { err(at, "changes 배열이 없습니다"); continue; }
  for (const [i, x] of c.changes.entries()) {
    const where = `${at} #${i + 1} (${x.tournament_id})`;
    if (!ids.has(x.tournament_id)) err(where, "tournaments.json 에 없는 tournament_id 입니다");
    if (!CHANGE_TYPES.includes(x.change_type)) err(where, `change_type 값 "${x.change_type}" 이 허용되지 않습니다 (${CHANGE_TYPES.join(", ")})`);
    if (!isText(x.summary_ko) || !isText(x.summary_en)) err(where, "summary_ko / summary_en 이 비어 있습니다");
    for (const f of ["before_ko", "after_ko", "before_en", "after_en", "label_ko", "label_en"]) if (!optText(x[f])) err(where, `${f} 는 문자열 또는 null 이어야 합니다`);
    merged.push({ date: c.generated_at, ...x });
  }
}
const headlines = {};
for (const name of fs.existsSync(changesDir) ? fs.readdirSync(changesDir).filter((f) => f.endsWith(".json")) : []) {
  try {
    const c = JSON.parse(fs.readFileSync(path.join(changesDir, name), "utf8"));
    headlines[c.generated_at] = { ko: c.headline_ko ?? null, en: c.headline_en ?? null };
  } catch {}
}

if (warnings.length) console.log(`\n데이터 확인 — 참고 사항 ${warnings.length}건 (배포는 진행됩니다)\n${warnings.join("\n")}`);
if (errors.length) {
  console.error(`\n데이터 오류 ${errors.length}건 — 배포를 중단합니다. 공개 사이트는 이전 상태로 유지됩니다.\n${errors.join("\n")}\n`);
  process.exit(1);
}
fs.mkdirSync(path.join(root, "app/generated"), { recursive: true });
fs.writeFileSync(path.join(root, "app/generated/changes.json"), JSON.stringify({ headlines, changes: merged }, null, 1));
console.log(`\n데이터 확인 완료 — 대회 ${ids.size}건, 변경 내역 ${merged.length}건\n`);
