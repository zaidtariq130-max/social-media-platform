require("./helpers/env");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { serializeConversation } = require("../src/serializers/conversation.serializer");

const alice = { _id: "u1", username: "alice", email: "alice@x.com" };
const bob = { _id: "u2", username: "bob", email: "bob@x.com" };

const baseConversation = (overrides = {}) => ({
  _id: "c1",
  participants: [alice, bob],
  messages: [
    {
      _id: "m1",
      sender: "u2",
      text: "hi",
      status: "sent",
      createdAt: new Date("2026-01-01"),
      deletedFor: [],
    },
  ],
  blockedBy: [],
  isGroup: false,
  lastMessageTime: new Date("2026-01-01"),
  createdAt: new Date("2026-01-01"),
  ...overrides,
});

test("receiver sees the chat in 'primary' with the unread count", () => {
  const result = serializeConversation(baseConversation(), "u1");
  assert.equal(result.folder, "primary");
  assert.equal(result.unreadCount, 1);
  assert.equal(result.participant.username, "bob");
});

test("the sender sees the chat in 'primary' with nothing unread", () => {
  const result = serializeConversation(baseConversation(), "u2");
  assert.equal(result.folder, "primary");
  assert.equal(result.unreadCount, 0);
});

test("blocked conversations go to the 'blocked' folder", () => {
  const result = serializeConversation(baseConversation({ blockedBy: ["u1"] }), "u1");
  assert.equal(result.folder, "blocked");
  assert.equal(result.isBlocked, true);
});

test("cleared chat hides older messages for that user only", () => {
  const conv = baseConversation({ clearedAt: { u1: new Date("2026-06-01") } });
  assert.equal(serializeConversation(conv, "u1").messages.length, 0);
  assert.equal(serializeConversation(conv, "u2").messages.length, 1);
});

test("messages deleted for me are hidden", () => {
  const conv = baseConversation();
  conv.messages[0].deletedFor = ["u1"];
  assert.equal(serializeConversation(conv, "u1").messages.length, 0);
});

test("group chats use the group name and member count", () => {
  const result = serializeConversation(
    baseConversation({ isGroup: true, groupName: "Team" }),
    "u1"
  );
  assert.equal(result.participant.name, "Team");
  assert.equal(result.participant.bio, "2 members");
});
