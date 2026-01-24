const { runLanguageChecks } = require("./checks/language");
const { runCspChecks } = require("./checks/csp");

const baseUrl = process.argv[2];
if (!baseUrl) {
  console.error("Usage: node tests/smoke/smoke-check.js <baseUrl>");
  process.exit(1);
}

const base = baseUrl.replace(/\/+$/, "");

const run = async () => {
  await runLanguageChecks(base);
  await runCspChecks(base);
};

run().catch((error) => {
  console.error(`[FAIL] ${error.message}`);
  process.exit(1);
});
