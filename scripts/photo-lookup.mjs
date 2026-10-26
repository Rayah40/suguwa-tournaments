// Finds a freely licensed city photo on Wikipedia / Wikimedia Commons.
// Used at build time for tournaments that have no photo file and no visual.image_url.
// Only Commons-hosted, freely licensed (CC BY / CC BY-SA / CC0 / Public domain), landscape photos are accepted.

const UA = "SuguWaTournamentsBuild/1.0 (https://tournaments.suguwa.com)";
const SKIP = /(map|flag|seal|coat[_ ]of[_ ]arms|locator|location|logo|emblem|icon|symbol|diagram|chart|signature|\.svg$|\.gif$|\.tif)/i;
const FREE = /^(cc[ -]?by|cc0|cc[ -]?zero|public domain|pd)/i;

export async function fetchJson(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const stripHtml = (s) => (s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const q = (params) => new URLSearchParams({ format: "json", formatversion: "2", ...params }).toString();

/** Returns {image_url, source_page, credit, license_url, file} or null. */
export async function findCityPhoto({ city, country }, get = fetchJson) {
  // 1. Find the city's Wikipedia article.
  const search = await get(
    "https://en.wikipedia.org/w/api.php?" +
      q({ action: "query", generator: "search", gsrsearch: `${city} ${country}`, gsrnamespace: "0", gsrlimit: "5", prop: "pageimages", piprop: "name" }),
  );
  const pages = (search?.query?.pages || []).slice().sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
  const c = norm(city);
  const page = pages.find((p) => norm(p.title).startsWith(c)) || pages.find((p) => norm(p.title).includes(c));
  if (!page) return null;

  // 2. Candidate files: the article's lead image first, then other images in the article.
  const files = [];
  if (page.pageimage) files.push("File:" + page.pageimage);
  const imgs = await get("https://en.wikipedia.org/w/api.php?" + q({ action: "query", titles: page.title, prop: "images", imlimit: "60" }));
  for (const im of imgs?.query?.pages?.[0]?.images || []) if (!files.includes(im.title)) files.push(im.title);
  const candidates = files.filter((f) => !SKIP.test(f)).slice(0, 25);
  if (!candidates.length) return null;

  // 3. Check license and shape on Commons (files that are not on Commons come back "missing" and are skipped).
  const info = await get(
    "https://commons.wikimedia.org/w/api.php?" +
      q({ action: "query", titles: candidates.join("|"), prop: "imageinfo", iiprop: "url|size|mime|extmetadata", iiurlwidth: "1600" }),
  );
  const byTitle = new Map((info?.query?.pages || []).map((p) => [p.title, p]));
  // Commons may normalise titles (e.g. underscores); map those back.
  for (const n of info?.query?.normalized || []) if (byTitle.has(n.to)) byTitle.set(n.from, byTitle.get(n.to));
  for (const f of candidates) {
    const p = byTitle.get(f);
    const ii = p && !p.missing && p.imageinfo?.[0];
    if (!ii) continue;
    if (!/^image\/(jpeg|png|webp)$/.test(ii.mime || "")) continue;
    if (!(ii.width >= 1000 && ii.width >= ii.height * 1.2)) continue;
    const meta = ii.extmetadata || {};
    const license = stripHtml(meta.LicenseShortName?.value);
    if (!FREE.test(license)) continue;
    const artist = stripHtml(meta.Artist?.value) || "Unknown author";
    return {
      image_url: ii.thumburl || ii.url,
      source_page: ii.descriptionurl,
      credit: `${artist} · ${license}`,
      license_url: meta.LicenseUrl?.value || ii.descriptionurl,
      file: f,
    };
  }
  return null;
}
