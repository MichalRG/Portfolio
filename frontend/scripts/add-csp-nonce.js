const fs = require("fs");
const path = require("path");

const nonce = process.env.CSP_NONCE;
if (!nonce) throw new Error("CSP_NONCE env var missing");

const indexPath = path.join(
  __dirname,
  "..",
  "dist",
  "portfolio-website",
  "browser",
  "index.html",
);
let html = fs.readFileSync(indexPath, "utf8");

// add nonce to ALL inline <style> tags (Angular usually has only one)
html = html.replace(/<style(?![^>]*nonce)/g, `<style nonce="${nonce}"`);
html = html.replace(
  "</head>",
  `<meta name="csp-nonce" content="${nonce}"></head>`,
);

fs.writeFileSync(indexPath, html);
console.log("✅ CSP nonce injected into index.html");

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
console.log("✅ CSP media hash generated");
