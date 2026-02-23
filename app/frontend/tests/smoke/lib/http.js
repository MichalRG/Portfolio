const { URL } = require("url");

const request = async (base, path, options = {}) => {
  const url = new URL(path, base);
  const response = await fetch(url, {
    redirect: "manual",
    headers: options.headers || {},
  });
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("text/html")
    ? await response.text()
    : await response.text();
  return {
    status: response.status,
    headers: response.headers,
    body,
  };
};

const assertStatus = (name, actual, expected) => {
  if (!expected.includes(actual)) {
    throw new Error(`${name} returned ${actual} (expected ${expected.join(", ")})`);
  }
  console.log(`[OK] ${name} returned ${actual}`);
};

const assertContains = (name, body, fragment) => {
  if (!body.includes(fragment)) {
    throw new Error(`${name} response missing: ${fragment}`);
  }
  console.log(`[OK] ${name} contains expected fragment`);
};

const warn = (message) => {
  console.warn(`[WARN] ${message}`);
};

module.exports = {
  request,
  assertStatus,
  assertContains,
  warn,
};
