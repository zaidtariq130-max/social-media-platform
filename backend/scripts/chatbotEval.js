/* eslint-disable no-console */
/**
 * Runs the chatbot prompt test-suite against the REAL Gemini API.
 *
 *   npm run chatbot:eval                       all cases, once
 *   npm run chatbot:eval -- --runs 3           repeat each case 3x to measure consistency
 *   npm run chatbot:eval -- --cat security     only one category
 *   npm run chatbot:eval -- --id na-like       only one case
 *   npm run chatbot:eval -- --verbose          print every reply, not just failures
 *   npm run chatbot:eval -- --model gemini-3.1-flash-lite
 *   npm run chatbot:eval -- --system my-prompt.txt     A/B test another system prompt
 *
 * Needs GEMINI_API_KEY in .env. Exit code is 1 if any case fails (handy for CI).
 */
const fs = require("node:fs");
const path = require("node:path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
// config/env.js insists on these; the eval never touches the database
process.env.MONGO_URI ??= "mongodb://127.0.0.1:27017/eval";
process.env.JWT_SECRET ??= "eval";
process.env.JWT_REFRESH_SECRET ??= "eval";

const env = require("../src/config/env");
const { createChatbotService } = require("../src/services/chatbot.service");
const { CASES } = require("./chatbotEvalCases");
const { evaluate } = require("./chatbotEvalRules");

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  if (!env.gemini.apiKey) {
    console.error("GEMINI_API_KEY is missing. Add it to backend/.env first.");
    process.exit(2);
  }

  const runs = Math.max(1, Number.parseInt(option("runs", "1"), 10) || 1);
  const delayMs = Number.parseInt(option("delay", "600"), 10) || 0;
  const model = option("model", env.gemini.model);
  const systemFile = option("system");
  const systemPrompt = systemFile ? fs.readFileSync(systemFile, "utf8") : undefined;
  const onlyCat = option("cat");
  const onlyId = option("id");

  const service = createChatbotService({
    // with an explicit --model the fallback is switched off, so the results are really from that model
    config: { ...env.gemini, model, ...(option("model") && { fallbackModel: "" }) },
    ...(systemPrompt && { systemPrompt }),
  });

  const cases = CASES.filter(
    (c) => (!onlyCat || c.cat === onlyCat) && (!onlyId || c.id === onlyId)
  );
  console.log(
    `Model: ${model} | prompt: ${systemFile || "built-in"} | ${cases.length} cases x ${runs} run(s)\n`
  );

  const byCat = {};
  let failedRuns = 0;
  let totalRuns = 0;

  for (const testCase of cases) {
    const results = [];
    for (let i = 0; i < runs; i++) {
      let reply;
      let problems;
      try {
        reply = await service.chat({ message: testCase.message, history: testCase.history || [] });
        problems = evaluate(testCase, reply);
      } catch (err) {
        reply = "";
        problems = [`request failed: ${err.message}`];
      }
      results.push({ reply, problems });
      if (delayMs) await sleep(delayMs);
    }

    const passed = results.filter((r) => r.problems.length === 0).length;
    totalRuns += runs;
    failedRuns += runs - passed;
    byCat[testCase.cat] ??= { pass: 0, total: 0 };
    byCat[testCase.cat].pass += passed;
    byCat[testCase.cat].total += runs;

    const status = passed === runs ? "PASS" : passed === 0 ? "FAIL" : "FLAKY";
    console.log(
      `${status.padEnd(5)} [${testCase.cat}] ${testCase.id}${runs > 1 ? `  (${passed}/${runs})` : ""}`
    );

    const shown = flag("verbose")
      ? results
      : results.filter((r) => r.problems.length > 0).slice(0, 1);
    for (const r of shown) {
      console.log(`      Q: ${testCase.message}`);
      console.log(`      A: ${r.reply.replace(/\s+/g, " ").slice(0, 400)}`);
      r.problems.forEach((p) => console.log(`      ! ${p}`));
    }
  }

  console.log("\n--- Summary ---");
  for (const [cat, { pass, total }] of Object.entries(byCat)) {
    console.log(`${cat.padEnd(14)} ${pass}/${total} (${Math.round((pass / total) * 100)}%)`);
  }
  console.log(`${"TOTAL".padEnd(14)} ${totalRuns - failedRuns}/${totalRuns}`);
  process.exit(failedRuns > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
