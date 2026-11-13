import type { MetaDescriptor } from "react-router";

export const SITE_URL = "https://portfolio.andikadinata.workers.dev/";
export const SITE_NAME = "Andika Dinata";
export const SITE_TITLE = "Andika Dinata — Vulnerability Researcher & Software Engineer";
export const SITE_DESCRIPTION = "Andika Dinata is a vulnerability researcher, software engineer, and computer science student at ITERA, based in Bandar Lampung, Indonesia.";
export const SOCIAL_IMAGE_URL = new URL("og-image.png", SITE_URL).href;
export const SOCIAL_IMAGE_ALT = "Andika Dinata — Vulnerability Researcher & Software Engineer, Bandar Lampung, Indonesia";

export function getProfileStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}#profile`,
    url: SITE_URL,
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    mainEntity: {
      "@type": "Person",
      "@id": `${SITE_URL}#person`,
      name: SITE_NAME,
      alternateName: "andika0x10",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      jobTitle: ["Vulnerability Researcher", "Software Engineer"],
      affiliation: { "@type": "CollegeOrUniversity", name: "Sumatera Institute of Technology", alternateName: "ITERA" },
      homeLocation: { "@type": "Place", name: "Bandar Lampung, Indonesia" },
      sameAs: ["https://github.com/andika0x10", "https://linkedin.com/in/andikadinata", "https://blog.andikadinata.workers.dev/"],
    },
  };
}

export function getHomeMetadata(): MetaDescriptor[] {
  return [
    { title: SITE_TITLE },
    { name: "description", content: SITE_DESCRIPTION },
    { name: "author", content: SITE_NAME },
    { name: "robots", content: "index, follow, max-image-preview:large" },
    { tagName: "link", rel: "canonical", href: SITE_URL },
    { property: "og:type", content: "website" },
    { property: "og:url", content: SITE_URL },
    { property: "og:title", content: SITE_TITLE },
    { property: "og:description", content: SITE_DESCRIPTION },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "en_US" },
    { property: "og:image", content: SOCIAL_IMAGE_URL },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: SOCIAL_IMAGE_ALT },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: SITE_TITLE },
    { name: "twitter:description", content: SITE_DESCRIPTION },
    { name: "twitter:image", content: SOCIAL_IMAGE_URL },
    { name: "twitter:image:alt", content: SOCIAL_IMAGE_ALT },
    { name: "twitter:creator", content: "@andika0x01" },
    { "script:ld+json": getProfileStructuredData() },
  ];
}

export function getErrorMetadata(status = 500): MetaDescriptor[] {
  return [
    { title: `${status === 404 ? "Page not found" : "Something went wrong"} — ${SITE_NAME}` },
    {
      name: "description",
      content:
        status === 404
          ? "This page could not be found. Return to Andika Dinata's portfolio."
          : "An unexpected error occurred. Return to Andika Dinata's portfolio or try again later.",
    },
    { name: "robots", content: "noindex, follow" },
  ];
}

export function getRobotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${new URL("sitemap.xml", SITE_URL).href}\n`;
}

export function getSitemapXml() {
  // Sections are anchors on one page; the external blog has its own sitemap.
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
  </url>
</urlset>
`;
}
