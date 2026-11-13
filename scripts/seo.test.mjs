import assert from "node:assert/strict";
import test from "node:test";
import { SITE_URL, SITE_TITLE, SOCIAL_IMAGE_URL, getHomeMetadata, getProfileStructuredData, getErrorMetadata, getRobotsTxt, getSitemapXml } from "../app/lib/seo.ts";

test("homepage identity and sharing metadata use the production canonical URL", () => {
  const metadata = getHomeMetadata();
  const value = (key, name) => metadata.find((item) => item[key] === name);
  assert.equal(SITE_URL, "https://portfolio.andikadinata.workers.dev/");
  assert.equal(metadata.filter((item) => "title" in item).length, 1);
  assert.equal(value("rel", "canonical").href, SITE_URL);
  assert.equal(value("property", "og:url").content, SITE_URL);
  assert.equal(value("property", "og:title").content, SITE_TITLE);
  assert.match(value("name", "robots").content, /^index,/);
  assert.equal(value("property", "og:image").content, SOCIAL_IMAGE_URL);
  assert.equal(value("name", "twitter:image").content, SOCIAL_IMAGE_URL);
  assert.equal(new URL(SOCIAL_IMAGE_URL).origin, new URL(SITE_URL).origin);
  assert.equal(value("name", "twitter:card").content, "summary_large_image");
});

test("profile structured data identifies the visible author and links the blog and profiles", () => {
  const profile = getProfileStructuredData();
  assert.equal(profile["@type"], "ProfilePage");
  assert.equal(profile.url, SITE_URL);
  assert.equal(profile.mainEntity["@type"], "Person");
  assert.equal(profile.mainEntity.name, "Andika Dinata");
  assert.equal(profile.mainEntity.url, SITE_URL);
  assert.deepEqual(profile.mainEntity.sameAs, ["https://github.com/andika0x10", "https://linkedin.com/in/andikadinata", "https://blog.andikadinata.workers.dev/"]);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(profile)));
  assert.deepEqual(getHomeMetadata().find((item) => "script:ld+json" in item)["script:ld+json"], profile);
});

for (const status of [404, 403, 500, 503]) {
  test(`HTTP ${status} metadata excludes the failed URL from indexing and homepage identity`, () => {
    const metadata = getErrorMetadata(status);
    assert.notEqual(metadata.find((item) => "title" in item).title, SITE_TITLE);
    assert.equal(metadata.find((item) => item.name === "robots").content, "noindex, follow");
    assert.equal(
      metadata.some((item) => item.rel === "canonical" || "script:ld+json" in item),
      false
    );
    assert.match(metadata.find((item) => "title" in item).title, status === 404 ? /Page not found/ : /Something went wrong/);
  });
}

test("sitemap lists only the canonical page, not fragments or the separately hosted blog", () => {
  const xml = getSitemapXml();
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, /xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
  assert.deepEqual(
    [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]),
    [SITE_URL]
  );
});

test("robots allows crawling the site and advertises its canonical sitemap", () => {
  const robots = getRobotsTxt();
  assert.match(robots, /^User-agent: \*\nAllow: \/\n/);
  assert.ok(robots.includes(`Sitemap: ${SITE_URL}sitemap.xml`));
  assert.doesNotMatch(robots, /^Disallow:/m);
});
