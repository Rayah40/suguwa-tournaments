import assert from "node:assert/strict";
import test from "node:test";
import { findCityPhoto } from "../scripts/photo-lookup.mjs";

// Fake Wikipedia / Commons API responses (formatversion=2 shapes).
function fakeApi({ lead, pageImages, commons }) {
  const calls = [];
  const get = async (url) => {
    calls.push(url);
    const u = new URL(url);
    const p = Object.fromEntries(u.searchParams);
    if (u.hostname === "en.wikipedia.org" && p.generator === "search")
      return { query: { pages: [
        { title: "Honolulu County", index: 2, pageimage: "County_map.svg" },
        { title: "Honolulu", index: 1, pageimage: lead },
      ] } };
    if (u.hostname === "en.wikipedia.org" && p.prop === "images")
      return { query: { pages: [{ title: p.titles, images: pageImages.map((t) => ({ ns: 6, title: t })) }] } };
    if (u.hostname === "commons.wikimedia.org")
      return { query: { pages: p.titles.split("|").map((t) => commons[t] ? { title: t, imageinfo: [commons[t]] } : { title: t, missing: true }) } };
    throw new Error("unexpected " + url);
  };
  return { get, calls };
}
const info = (o) => ({ mime: "image/jpeg", width: 4000, height: 2600, url: "https://upload.wikimedia.org/x/orig.jpg", thumburl: "https://upload.wikimedia.org/x/1600px.jpg", descriptionurl: "https://commons.wikimedia.org/wiki/File:X.jpg",
  extmetadata: { LicenseShortName: { value: "CC BY-SA 4.0" }, LicenseUrl: { value: "https://creativecommons.org/licenses/by-sa/4.0" }, Artist: { value: '<a href="//x">Jane Doe</a>' } }, ...o });

test("uses the article's lead photo when it is free, landscape and on Commons", async () => {
  const { get } = fakeApi({ lead: "Honolulu_skyline.jpg", pageImages: [], commons: { "File:Honolulu_skyline.jpg": info({}) } });
  const r = await findCityPhoto({ city: "Honolulu", country: "United States" }, get);
  assert.equal(r.image_url, "https://upload.wikimedia.org/x/1600px.jpg");
  assert.equal(r.credit, "Jane Doe · CC BY-SA 4.0");
  assert.equal(r.license_url, "https://creativecommons.org/licenses/by-sa/4.0");
});

test("skips maps, non-Commons, non-free and portrait images", async () => {
  const { get } = fakeApi({
    lead: "Local_only.jpg",
    pageImages: ["File:Hawaii_location_map.png", "File:Flag_of_Hawaii.svg", "File:Portrait.jpg", "File:Fair_use.jpg", "File:Waikiki_beach.jpg"],
    commons: {
      "File:Portrait.jpg": info({ width: 1200, height: 1800 }),
      "File:Fair_use.jpg": info({ extmetadata: { LicenseShortName: { value: "Fair use" } } }),
      "File:Waikiki_beach.jpg": info({ thumburl: "https://upload.wikimedia.org/w/1600px-Waikiki.jpg" }),
    },
  });
  const r = await findCityPhoto({ city: "Honolulu", country: "United States" }, get);
  assert.equal(r.file, "File:Waikiki_beach.jpg");
  assert.equal(r.image_url, "https://upload.wikimedia.org/w/1600px-Waikiki.jpg");
});

test("returns null when nothing suitable exists", async () => {
  const { get } = fakeApi({ lead: undefined, pageImages: ["File:Map.png"], commons: {} });
  assert.equal(await findCityPhoto({ city: "Honolulu", country: "United States" }, get), null);
});
