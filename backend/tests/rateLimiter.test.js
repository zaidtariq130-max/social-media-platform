const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createLimiter } = require("../src/utils/rateLimiter");

test("allows up to max actions per window, then blocks", () => {
  const allow = createLimiter({ max: 3, windowMs: 1000 });
  assert.deepEqual([allow(), allow(), allow(), allow()], [true, true, true, false]);
});

test("allows again after the window passes", async () => {
  const allow = createLimiter({ max: 1, windowMs: 20 });
  assert.equal(allow(), true);
  assert.equal(allow(), false);
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(allow(), true);
});
