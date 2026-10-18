require("./helpers/env");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
} = require("../src/utils/tokens");

test("access token round-trips the user id", () => {
  assert.equal(verifyAccessToken(signAccessToken("abc")).id, "abc");
});

test("access and refresh tokens use different secrets", () => {
  assert.throws(() => verifyRefreshToken(signAccessToken("abc")));
  assert.throws(() => verifyAccessToken(signRefreshToken("abc")));
});

test("two refresh tokens for the same user are always different (and hash differently)", () => {
  const a = signRefreshToken("abc");
  const b = signRefreshToken("abc");
  assert.notEqual(a, b);
  assert.notEqual(hashToken(a), hashToken(b));
});

test("hashToken is stable", () => {
  assert.equal(hashToken("x"), hashToken("x"));
});
