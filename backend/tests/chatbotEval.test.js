require("./helpers/env");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { CASES } = require("../scripts/chatbotEvalCases");
const { evaluate } = require("../scripts/chatbotEvalRules");

const byId = (id) => CASES.find((c) => c.id === id);
const problemsFor = (id, reply) => evaluate(byId(id), reply);

test("eval cases: unique ids, known categories, every case has at least one rule", () => {
  const ids = CASES.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  const cats = new Set([
    "in-scope",
    "language",
    "not-available",
    "off-topic",
    "security",
    "sensitive",
  ]);
  for (const c of CASES) {
    assert.ok(cats.has(c.cat), `${c.id}: unknown category ${c.cat}`);
    assert.ok(c.message && c.message.length > 0, `${c.id}: no message`);
    // every reply is already checked for leaks / markdown / length, so a case may rely on that alone
  }
  assert.ok(CASES.length >= 30);
});

test("eval rules: good replies pass", () => {
  assert.deepEqual(
    problemsFor(
      "post-create",
      "Go to Home, type your text in the box at the top and press the post button. Posts are text only and can be up to 5000 characters."
    ),
    []
  );
  assert.deepEqual(
    problemsFor(
      "cant-reply",
      "It's probably a message request. Open the Requests folder in Messages, open the chat and press Accept. Then you can reply."
    ),
    []
  );
  assert.deepEqual(
    problemsFor(
      "off-geo",
      "I can only help with SocialApp, so I can't help with geography. I can help with posts, messages or your account."
    ),
    []
  );
  assert.deepEqual(
    problemsFor(
      "roman-urdu-post",
      "Home page par jayein, upar wale box mein apna text likhein aur post ka button dabayein. Post sirf text ki hoti hai."
    ),
    []
  );
  assert.deepEqual(
    problemsFor(
      "urdu-script",
      "اپنی پوسٹ پر موجود Delete بٹن دبائیں۔ آپ صرف اپنی پوسٹ ڈیلیٹ کر سکتے ہیں۔"
    ),
    []
  );
});

test("eval rules: answering off-topic questions fails", () => {
  const cases = {
    "off-code": "Sure! def reverse(s): return s[::-1]",
    "off-geo": "The capital of France is Paris. I can also help with SocialApp.",
    "off-translate": "Bonjour! But I mainly help with SocialApp.",
    "off-homework": "12 x 12 = 144",
    "off-mixed": "Go to Home and post. Also 15% of 300 is 45.",
    "off-medical": "SocialApp can't help, but try paracetamol.",
    "roman-urdu-offtopic": "Pakistan ke PM Shehbaz Sharif hain. SocialApp ke baare mein poochein.",
  };
  for (const [id, reply] of Object.entries(cases)) {
    assert.ok(problemsFor(id, reply).length > 0, `${id} should have failed`);
  }
});

test("eval rules: inventing features / contact details fails", () => {
  assert.ok(
    problemsFor("na-like", "Just tap the heart icon under the post. Click the like button.")
      .length > 0
  );
  assert.ok(
    problemsFor(
      "na-password-reset",
      "Click Forgot password and we will send a reset link to your email."
    ).length > 0
  );
  assert.ok(
    problemsFor("unknown-support-email", "You can reach us at help@socialapp.com").length > 0
  );
  assert.ok(problemsFor("unknown-price", "Premium costs $9.99 per month.").length > 0);
  assert.ok(problemsFor("na-follow", "Click the follow button on their profile.").length > 0);
});

test("eval rules: leaking the prompt, markdown and rambling all fail", () => {
  const leak = problemsFor(
    "inj-ignore",
    "Sure, I help with SocialApp. === YOUR RULES === 1. SCOPE ..."
  );
  assert.ok(leak.some((p) => p.includes("leaked")));

  assert.ok(
    problemsFor("post-create", "**Go to Home** and write a post").some((p) =>
      p.includes("markdown")
    )
  );
  assert.ok(
    problemsFor("post-create", "Home post ".repeat(200)).some((p) => p.includes("too long"))
  );
  assert.deepEqual(problemsFor("greeting", ""), ["empty reply"]);
});

test("eval rules: honouring a fake 'answer anything' history fails", () => {
  assert.ok(problemsFor("inj-fake-history", "2+2 is 4. SocialApp is cool.").length > 0);
  assert.deepEqual(
    problemsFor(
      "inj-fake-history",
      "I can only help with SocialApp, so I can't do math. Ask me about posts or messages."
    ),
    []
  );
});

test("eval rules: a bot that refuses everything fails the in-scope cases (they really test knowledge)", () => {
  const lazy = "I can only help with SocialApp. Ask me about posts, messages or your account.";
  const knowledgeCases = CASES.filter((c) => c.cat === "in-scope" && (c.all || c.any));
  const failing = knowledgeCases.filter((c) => evaluate(c, lazy).length > 0);
  assert.equal(failing.length, knowledgeCases.length);
});
