const { z } = require("zod");
const { LIMITS } = require("../config/constants");
const { pagination } = require("./common.validator");

const listUsersQuery = pagination.extend({
  q: z.string().trim().max(50).optional(),
});

// accepts "ali" and "@ali"
const usernameParams = z.object({
  username: z
    .string("Username is required")
    .trim()
    .transform((value) => value.replace(/^@/, ""))
    .pipe(
      z
        .string()
        .min(LIMITS.USERNAME_MIN, `Username must be at least ${LIMITS.USERNAME_MIN} characters`)
        .max(LIMITS.USERNAME_MAX, `Username must be at most ${LIMITS.USERNAME_MAX} characters`)
    ),
});

module.exports = { listUsersQuery, usernameParams };
