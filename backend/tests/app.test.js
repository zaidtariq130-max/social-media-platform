require("./helpers/env");
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const createApp = require("../src/app");
const { signAccessToken } = require("../src/utils/tokens");

let server;
let base;

before(async () => {
  server = http.createServer(createApp());
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

const call = async (path, options = {}) => {
  const res = await fetch(base + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};

test("GET /health works without a database", async () => {
  const { status, body } = await call("/health");
  assert.equal(status, 200);
  assert.equal(body.status, "ok");
});

test("unknown route -> standard 404 json", async () => {
  const { status, body } = await call("/api/nope");
  assert.equal(status, 404);
  assert.equal(body.success, false);
});

test("protected routes reject missing and bad tokens", async () => {
  for (const path of [
    "/api/posts",
    "/api/users",
    "/api/conversations",
    "/api/auth/profile",
    "/api/friends",
    "/api/friends/people",
    "/api/friends/requests",
    "/api/users/me/stats",
  ]) {
    assert.equal((await call(path)).status, 401, path);
    assert.equal(
      (await call(path, { headers: { Authorization: "Bearer junk" } })).status,
      401,
      path
    );
  }
});

test("signup validation errors come back as 400 with a readable message", async () => {
  const { status, body } = await call("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username: "ab", email: "bad", password: "x" }),
  });
  assert.equal(status, 400);
  assert.equal(body.success, false);
  assert.ok(body.message.length > 0);
  assert.ok(Array.isArray(body.errors));
});

test("login without a body is a 400, not a crash", async () => {
  const { status } = await call("/api/auth/login", { method: "POST" });
  assert.equal(status, 400);
});

test("broken JSON -> 400", async () => {
  const { status, body } = await call("/api/auth/login", { method: "POST", body: "{oops" });
  assert.equal(status, 400);
  assert.equal(body.message, "Invalid JSON body");
});

test("valid token + invalid input is rejected before touching the database", async () => {
  const headers = { Authorization: `Bearer ${signAccessToken("507f1f77bcf86cd799439011")}` };

  const emptyPost = await call("/api/posts", {
    method: "POST",
    headers,
    body: JSON.stringify({ content: "   " }),
  });
  assert.equal(emptyPost.status, 400);

  const badId = await call("/api/posts/not-an-id", { method: "DELETE", headers });
  assert.equal(badId.status, 400);

  const badGroup = await call("/api/conversations/group", {
    method: "POST",
    headers,
    body: JSON.stringify({ participantIds: [] }),
  });
  assert.equal(badGroup.status, 400);
});

test("refresh without a cookie -> 401", async () => {
  const { status } = await call("/api/auth/refresh", { method: "POST" });
  assert.equal(status, 401);
});
