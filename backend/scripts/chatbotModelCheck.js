/* eslint-disable no-console */
/**
 * Asks every Gemini "flash" model available to YOUR key a tiny question and prints which ones work
 * right now, and how fast. Use it when the chatbot shows errors, then put a working model in .env:
 *
 *   npm run chatbot:models                       check all flash models of your key
 *   npm run chatbot:models -- gemini-3.1-flash-lite gemini-flash-latest     check only these
 *
 * Needs GEMINI_API_KEY in .env. The key itself is never printed.
 */
const path = require("node:path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
// config/env.js insists on these; this script never touches the database
process.env.MONGO_URI ??= "mongodb://127.0.0.1:27017/eval";
process.env.JWT_SECRET ??= "eval";
process.env.JWT_REFRESH_SECRET ??= "eval";

const { GoogleGenAI } = require("@google/genai");
const env = require("../src/config/env");

const SKIP = /image|tts|live|audio|embed|robot|computer|native|veo|imagen/i;
const MAX_MODELS = 8;

async function listFlashModels(ai) {
  const names = [];
  for await (const model of await ai.models.list()) {
    const name = String(model.name || "").replace(/^models\//, "");
    if (/gemini/i.test(name) && /flash/i.test(name) && !SKIP.test(name)) names.push(name);
  }
  return names.slice(0, MAX_MODELS);
}

async function main() {
  if (!env.gemini.apiKey) {
    console.error("GEMINI_API_KEY is missing. Add it to backend/.env first.");
    process.exit(2);
  }

  const ai = new GoogleGenAI({
    apiKey: env.gemini.apiKey,
    httpOptions: { timeout: env.gemini.timeoutMs },
  });

  const wanted = process.argv.slice(2);
  let models = wanted;
  if (models.length === 0) {
    try {
      models = await listFlashModels(ai);
    } catch (err) {
      console.error(`Could not list models (${err.status || "no status"}): ${err.message}`);
      console.error("Is the key correct? Is the internet / VPN blocking Google?");
      process.exit(2);
    }
  }
  if (models.length === 0) {
    console.error("No flash models found for this key.");
    process.exit(2);
  }

  console.log(`Testing ${models.length} model(s), one tiny question each...\n`);
  const working = [];
  for (const model of models) {
    const started = Date.now();
    try {
      await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: "Reply with the single word OK." }] }],
        config: { maxOutputTokens: 20 },
      });
      const seconds = ((Date.now() - started) / 1000).toFixed(1);
      console.log(`OK    ${seconds.padStart(5)}s  ${model}`);
      working.push({ model, ms: Date.now() - started });
    } catch (err) {
      const seconds = ((Date.now() - started) / 1000).toFixed(1);
      const reason = String(err.message || "").replace(/\s+/g, " ").slice(0, 90);
      console.log(`FAIL  ${seconds.padStart(5)}s  ${model}  [${err.status || "no status"}] ${reason}`);
    }
  }

  console.log("");
  if (working.length === 0) {
    console.log("No model answered right now. If the status is 503 everywhere, Google is overloaded:");
    console.log("wait 15-30 minutes and run this again. If it is 400/403, the key is the problem.");
    process.exit(1);
  }
  working.sort((a, b) => a.ms - b.ms);
  console.log("Put the fastest working model in backend/.env and restart the server:");
  console.log(`GEMINI_MODEL=${working[0].model}`);
  if (working[1]) console.log(`GEMINI_FALLBACK_MODEL=${working[1].model}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
