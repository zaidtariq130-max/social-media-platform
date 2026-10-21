require("./helpers/env");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { relationshipOf, serializeRequest } = require("../src/serializers/friend.serializer");
const {
  sendRequestBody,
  respondBody,
  requestsQuery,
} = require("../src/validators/friend.validator");

const A = "a".repeat(24);
const B = "b".repeat(24);
const user = (id, username) => ({ _id: id, username, email: `${username}@x.com` });

test("relationshipOf: no document or declined means none", () => {
  assert.equal(relationshipOf(null, A).status, "none");
  assert.equal(
    relationshipOf({ _id: "r", requester: A, recipient: B, status: "declined" }, A).status,
    "none"
  );
});

test("relationshipOf: pending is sent for the sender and received for the receiver", () => {
  const pending = { _id: "r1", requester: A, recipient: B, status: "pending" };
  assert.deepEqual(relationshipOf(pending, A), { status: "request_sent", requestId: "r1" });
  assert.deepEqual(relationshipOf(pending, B), { status: "request_received", requestId: "r1" });
});

test("relationshipOf: accepted is friends for both users", () => {
  const accepted = { _id: "r2", requester: A, recipient: B, status: "accepted" };
  assert.equal(relationshipOf(accepted, A).status, "friends");
  assert.equal(relationshipOf(accepted, B).status, "friends");
});

test("serializeRequest: shows the other user and the direction", () => {
  const friendship = {
    _id: "r3",
    requester: user(A, "ali"),
    recipient: user(B, "sara"),
    status: "pending",
  };
  const incoming = serializeRequest(friendship, B);
  assert.equal(incoming.direction, "incoming");
  assert.equal(incoming.user.username, "ali");
  assert.equal(serializeRequest(friendship, A).user.username, "sara");
});

test("friend validators", () => {
  assert.equal(sendRequestBody.safeParse({ userId: A }).success, true);
  assert.equal(sendRequestBody.safeParse({ userId: "nope" }).success, false);
  assert.equal(respondBody.safeParse({ action: "accept" }).success, true);
  assert.equal(respondBody.safeParse({ action: "maybe" }).success, false);
  assert.equal(requestsQuery.parse({}).type, "incoming");
});
