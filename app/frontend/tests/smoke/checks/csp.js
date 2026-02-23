const { request, assertStatus } = require("../lib/http");

const requireHeaderIncludes = (name, headers, headerName, fragments) => {
  const value = headers.get(headerName) || "";
  if (!value) {
    throw new Error(`${name} missing header: ${headerName}`);
  }
  fragments.forEach((fragment) => {
    if (!value.includes(fragment)) {
      throw new Error(
        `${name} header ${headerName} missing fragment: ${fragment}`,
      );
    }
  });
  console.log(`[OK] ${name} header ${headerName} contains expected fragments`);
};

const runCspChecks = async (base) => {
  const root = await request(base, "/");
  assertStatus("GET / (headers)", root.status, [200]);

  requireHeaderIncludes("GET /", root.headers, "content-security-policy", [
    "default-src 'self'",
    "script-src 'self'",
    "style-src-elem 'self'",
  ]);

  requireHeaderIncludes("GET /", root.headers, "strict-transport-security", [
    "max-age=",
  ]);
};

module.exports = { runCspChecks };
