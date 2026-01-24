const fs = require("fs");
const path = require("path");

const nonce = process.env.CSP_NONCE;
if (!nonce) throw new Error("CSP_NONCE env var missing");

const defaultIndexPaths = [
  path.join(
    __dirname,
    "..",
    "dist",
    "portfolio-website",
    "browser",
    "index.html",
  ),
  path.join(
    __dirname,
    "..",
    "dist",
    "portfolio-website",
    "browser",
    "pl",
    "index.html",
  ),
];

const filesArg = process.argv
  .slice(2)
  .find((arg) => arg.startsWith("--files="));
const explicitPaths = filesArg
  ? filesArg
      .replace("--files=", "")
      .split(",")
      .map((filePath) =>
        path.isAbsolute(filePath)
          ? filePath
          : path.join(__dirname, "..", filePath),
      )
  : [];
const indexPaths = (explicitPaths.length ? explicitPaths : defaultIndexPaths).filter(
  (filePath) => fs.existsSync(filePath),
);

if (!indexPaths.length) {
  throw new Error("No index.html files found to inject CSP nonce");
}

indexPaths.forEach((indexPath) => {
  let html = fs.readFileSync(indexPath, "utf8");

  // add nonce to ALL inline <style> tags (Angular usually has only one)
  html = html.replace(/<style(?![^>]*nonce)/g, `<style nonce="${nonce}"`);
  if (!html.includes('name="csp-nonce"')) {
    html = html.replace(
      "</head>",
      `<meta name="csp-nonce" content="${nonce}"></head>`,
    );
  }

  fs.writeFileSync(indexPath, html);
  console.log(`[OK] CSP nonce injected into ${indexPath}`);
});

const crypto = require("crypto");
const handler = "this.media='all'";
const handlerHash = crypto
  .createHash("sha256")
  .update(handler)
  .digest("base64");
fs.writeFileSync(
  path.join(__dirname, "..", "dist", "handlerHash.txt"),
  handlerHash,
);
console.log("[OK] CSP media hash generated");
