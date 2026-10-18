require("./helpers/env");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { signupBody, loginBody } = require("../src/validators/auth.validator");
const { createGroupBody, listMessagesQuery } = require("../src/validators/conversation.validator");

const validSignup = { username: "  Ali  ", email: " Ali@Example.COM ", password: "supersecret" };

test("signup: trims username and normalises email", () => {
  const result = signupBody.parse(validSignup);
  assert.equal(result.username, "Ali");
  assert.equal(result.email, "ali@example.com");
});

test("signup: rejects short password, bad email, short username", () => {
  assert.equal(signupBody.safeParse({ ...validSignup, password: "short" }).success, false);
  assert.equal(signupBody.safeParse({ ...validSignup, email: "nope" }).success, false);
  assert.equal(signupBody.safeParse({ ...validSignup, username: "ab" }).success, false);
  assert.equal(signupBody.safeParse({}).success, false);
});

test("signup: gives readable messages", () => {
  const { error } = signupBody.safeParse({ ...validSignup, password: "short" });
  assert.match(error.issues[0].message, /Password must be at least 8/);
});

test("login: only needs email + password", () => {
  assert.equal(loginBody.safeParse({ email: "a@b.com", password: "x" }).success, true);
  assert.equal(loginBody.safeParse({ email: "a@b.com" }).success, false);
});

test("group: needs at least one valid member id", () => {
  assert.equal(createGroupBody.safeParse({ participantIds: [] }).success, false);
  assert.equal(createGroupBody.safeParse({ participantIds: ["not-an-id"] }).success, false);
  assert.equal(
    createGroupBody.safeParse({ participantIds: ["507f1f77bcf86cd799439011"] }).success,
    true
  );
});

test("message list query: applies defaults and coerces numbers", () => {
  const result = listMessagesQuery.parse({ limit: "20" });
  assert.equal(result.limit, 20);
  assert.equal(listMessagesQuery.parse({}).limit, 50);
  assert.equal(listMessagesQuery.safeParse({ limit: "9999" }).success, false);
});
