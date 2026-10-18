require("./helpers/env");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { directKeyOf } = require("../src/utils/id");
const { usernameParams } = require("../src/validators/user.validator");
const requireAllowedOrigin = require("../src/middleware/sameOrigin.middleware");

test("directKeyOf: same key no matter who starts the chat", () => {
  assert.equal(directKeyOf("b", "a"), directKeyOf("a", "b"));
  assert.equal(directKeyOf("a", "b"), "a:b");
  assert.notEqual(directKeyOf("a", "b"), directKeyOf("a", "c"));
});

test("usernameParams: accepts @name, trims, rejects too short/long", () => {
  assert.equal(usernameParams.parse({ username: " @ali " }).username, "ali");
  assert.equal(usernameParams.parse({ username: "sara" }).username, "sara");
  assert.equal(usernameParams.safeParse({ username: "@a" }).success, false);
  assert.equal(usernameParams.safeParse({ username: "x".repeat(31) }).success, false);
  assert.equal(usernameParams.safeParse({}).success, false);
});

const runOrigin = (origin) => {
  let result = "next";
  requireAllowedOrigin({ headers: origin ? { origin } : {} }, {}, (err) => {
    if (err) result = err.status;
  });
  return result;
};

test("requireAllowedOrigin: only the configured client (or no Origin) passes", () => {
  assert.equal(runOrigin(undefined), "next");
  assert.equal(runOrigin("http://localhost:5173"), "next");
  assert.equal(runOrigin("http://localhost:5173/"), "next");
  assert.equal(runOrigin("https://evil.example"), 403);
});
