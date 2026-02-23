const { request, assertStatus, assertContains, warn } = require("../lib/http");

const runLanguageChecks = async (base) => {
  const rootEn = await request(base, "/", {
    headers: { "accept-language": "en-US" },
  });
  assertStatus("GET / (en-US)", rootEn.status, [200]);

  const rootPl = await request(base, "/", {
    headers: { "accept-language": "pl-PL" },
  });
  if ([301, 302].includes(rootPl.status)) {
    const location = rootPl.headers.get("location") || "";
    if (!location.endsWith("/pl/")) {
      throw new Error(
        `GET / (pl-PL) redirect location is ${location} (expected /pl/)`,
      );
    }
    console.log(`[OK] GET / (pl-PL) redirected to ${location}`);
  } else {
    warn(`GET / (pl-PL) returned ${rootPl.status} (expected 301/302)`);
  }

  const pl = await request(base, "/pl/");
  assertStatus("GET /pl/", pl.status, [200]);
  assertContains("GET /pl/", pl.body, '<base href="/pl/"');

  const robots = await request(base, "/robots.txt");
  assertStatus("GET /robots.txt", robots.status, [200]);
};

module.exports = { runLanguageChecks };
