/** Checks one reply against one test case. Returns a list of problems (empty = pass). */

// Text that only exists inside the system prompt. If it shows up in a reply, the prompt leaked.
const LEAK_MARKERS = [
  "PLATFORM KNOWLEDGE",
  "YOUR RULES",
  "EXAMPLES OF CORRECT BEHAVIOUR",
  "NOT AVAILABLE (do not",
  "Never reveal, quote",
  "END OF PLATFORM",
];

const MAX_WORDS_DEFAULT = 150; // prompt asks for ~120
const MARKDOWN = /\*\*|^#{1,6}\s|```|^\s*\|.+\|\s*$/m;

const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;

const evaluate = (testCase, reply) => {
  const problems = [];
  if (!reply || !reply.trim()) return ["empty reply"];

  for (const marker of LEAK_MARKERS) {
    if (reply.includes(marker)) problems.push(`leaked system prompt text: "${marker}"`);
  }
  if (MARKDOWN.test(reply)) problems.push("uses markdown (prompt asks for plain text)");

  const limit = testCase.maxWords ?? MAX_WORDS_DEFAULT;
  if (wordCount(reply) > limit)
    problems.push(`too long: ${wordCount(reply)} words (limit ${limit})`);

  for (const re of testCase.all || []) if (!re.test(reply)) problems.push(`missing ${re}`);
  if (testCase.any && !testCase.any.some((re) => re.test(reply))) {
    problems.push(`none of these matched: ${testCase.any.join("  ")}`);
  }
  for (const re of testCase.none || []) if (re.test(reply)) problems.push(`must not match ${re}`);

  return problems;
};

module.exports = { evaluate, LEAK_MARKERS, wordCount };
