const {
  GoogleGenAI,
  ThinkingLevel,
  HarmCategory,
  HarmBlockThreshold,
  FinishReason,
  ApiError,
} = require("@google/genai");
const env = require("../config/env");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const { MAX_OUTPUT_TOKENS, FALLBACKS, RETRY } = require("../chatbot/config");
const { SYSTEM_PROMPT } = require("../chatbot/systemPrompt");

// Safety filters of Gemini itself (a second line of defence next to the system prompt).
// "Dangerous content" is only blocked at HIGH so a user who says they feel unsafe still gets a caring answer.
const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

const BLOCKED_FINISH_REASONS = new Set(
  [
    FinishReason.SAFETY,
    FinishReason.PROHIBITED_CONTENT,
    FinishReason.BLOCKLIST,
    FinishReason.SPII,
    FinishReason.RECITATION,
  ].filter(Boolean)
);

const ROLE = { user: "user", model: "model", assistant: "model" };

/**
 * Turns the client's chat history + the new question into Gemini `contents`.
 * - the history is untrusted input, so it can only ever be user/model text (never a system role)
 * - Gemini wants the conversation to start with a user turn
 * - neighbouring turns of the same role are merged
 */
const buildContents = (history = [], message) => {
  const turns = [];
  const push = (role, text) => {
    const last = turns[turns.length - 1];
    if (last && last.role === role) last.parts[0].text += `\n${text}`;
    else turns.push({ role, parts: [{ text }] });
  };

  for (const item of history) {
    const role = ROLE[item.role];
    if (!role) continue;
    if (turns.length === 0 && role !== "user") continue;
    push(role, item.text);
  }
  push("user", message);
  return turns;
};

/** Gemini response -> plain reply text, or a safe fallback when it was blocked / empty. */
const extractReply = (response) => {
  if (response?.promptFeedback?.blockReason) return FALLBACKS.BLOCKED;

  const finishReason = response?.candidates?.[0]?.finishReason;
  if (BLOCKED_FINISH_REASONS.has(finishReason)) return FALLBACKS.BLOCKED;

  const text = (response?.text || "").trim();
  return text || FALLBACKS.EMPTY;
};

const toThinkingConfig = (level) => {
  if (!level) return undefined;
  const mapped = ThinkingLevel[level.toUpperCase()];
  if (!mapped) {
    logger.warn(
      `Ignoring invalid GEMINI_THINKING_LEVEL "${level}" (use minimal, low, medium or high)`
    );
    return undefined;
  }
  return { thinkingLevel: mapped };
};

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 503 "high demand", 429 and 5xx are temporary; a bad key or a bad request will never fix itself. */
const isRetryable = (err) => RETRY.STATUSES.includes(err?.status);

const retryDelay = (attempt) =>
  RETRY.BASE_DELAY_MS * 2 ** (attempt - 1) + Math.floor(Math.random() * RETRY.JITTER_MS);

/** Never leaks Gemini's raw error (could contain request details) to the browser. */
const toAppError = (err) => {
  if (err instanceof AppError) return err;
  const status = err instanceof ApiError ? err.status : undefined;
  logger.error(`Gemini request failed${status ? ` (${status})` : ""}:`, err?.message || err);
  return new AppError(503, FALLBACKS.UNAVAILABLE);
};

/**
 * @param getClient     () => GoogleGenAI-like object. Injected so tests never call the real API.
 * @param systemPrompt  override, only used by `npm run chatbot:eval` to A/B test prompt variants
 * @param sleep         injected so tests do not really wait between retries
 */
const createChatbotService = ({
  getClient,
  config = env.gemini,
  systemPrompt = SYSTEM_PROMPT,
  sleep = defaultSleep,
} = {}) => {
  let client = null;
  const resolveClient = getClient
    ? getClient
    : () => {
        if (!config.apiKey) throw new AppError(503, FALLBACKS.UNAVAILABLE);
        client ??= new GoogleGenAI({
          apiKey: config.apiKey,
          httpOptions: { timeout: config.timeoutMs },
        });
        return client;
      };

  // main model first, then the fallback (if one is set and it is a different model)
  const models = [config.model, config.fallbackModel].filter(
    (model, i, all) => model && all.indexOf(model) === i
  );

  /** Tries each model up to ATTEMPTS_PER_MODEL times on temporary errors. Any other error is thrown at once. */
  const generate = async (ai, params) => {
    let lastError;
    for (const model of models) {
      for (let attempt = 1; attempt <= RETRY.ATTEMPTS_PER_MODEL; attempt++) {
        try {
          const response = await ai.models.generateContent({ ...params, model });
          return { response, model };
        } catch (err) {
          if (!isRetryable(err)) throw err;
          lastError = err;
          logger.warn(`Gemini ${err.status} on ${model} (attempt ${attempt}/${RETRY.ATTEMPTS_PER_MODEL})`);
          if (attempt < RETRY.ATTEMPTS_PER_MODEL) await sleep(retryDelay(attempt));
        }
      }
    }
    throw lastError;
  };

  const chat = async ({ message, history = [] }) => {
    const ai = resolveClient();

    let result;
    try {
      result = await generate(ai, {
        contents: buildContents(history, message),
        config: {
          systemInstruction: systemPrompt,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          safetySettings: SAFETY_SETTINGS,
          thinkingConfig: toThinkingConfig(config.thinkingLevel),
        },
      });
    } catch (err) {
      throw toAppError(err);
    }

    const { response, model } = result;
    const total = response?.usageMetadata?.totalTokenCount;
    if (total) logger.info(`chatbot: ${total} tokens (${model})`);

    return extractReply(response);
  };

  return { chat };
};

module.exports = { ...createChatbotService(), createChatbotService, buildContents, extractReply };
