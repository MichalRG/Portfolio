const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const nonce = process.env.CSP_NONCE;
if (!nonce) throw new Error("CSP_NONCE env var missing");

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: "inherit", shell: true });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run("npx", ["ng", "build", "--configuration", "production"]);
run("npx", [
  "ng",
  "build",
  "--configuration",
  "production,pl",
  "--output-path",
  "dist/portfolio-website-pl",
]);

const plSourceIndex = path.join(
  __dirname,
  "..",
  "dist",
  "portfolio-website-pl",
  "browser",
  "index.html",
);
const plTargetDir = path.join(
  __dirname,
  "..",
  "dist",
  "portfolio-website",
  "browser",
  "pl",
);
const plTargetIndex = path.join(plTargetDir, "index.html");

fs.mkdirSync(plTargetDir, { recursive: true });
fs.copyFileSync(plSourceIndex, plTargetIndex);

run("node", [
  "scripts/add-csp-nonce.js",
  "--files=dist/portfolio-website/browser/index.html,dist/portfolio-website/browser/pl/index.html",
]);
