const { z } = require("zod");
const { LIMITS } = require("../config/constants");

const postBody = z.object({
  content: z
    .string("Post content is required")
    .trim()
    .min(1, "Post content is required")
    .max(LIMITS.POST_MAX, `Post is too long (max ${LIMITS.POST_MAX} characters)`),
});

module.exports = { postBody };
