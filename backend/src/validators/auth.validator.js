const { z } = require("zod");
const { LIMITS } = require("../config/constants");

const signupBody = z.object({
  username: z
    .string("Username is required")
    .trim()
    .min(LIMITS.USERNAME_MIN, `Username must be at least ${LIMITS.USERNAME_MIN} characters`)
    .max(LIMITS.USERNAME_MAX, `Username must be at most ${LIMITS.USERNAME_MAX} characters`),
  email: z
    .string("Email is required")
    .trim()
    .toLowerCase()
    .pipe(z.email("Please enter a valid email address")),
  password: z
    .string("Password is required")
    .min(LIMITS.PASSWORD_MIN, `Password must be at least ${LIMITS.PASSWORD_MIN} characters`)
    .max(LIMITS.PASSWORD_MAX, `Password must be at most ${LIMITS.PASSWORD_MAX} characters`),
});

const loginBody = z.object({
  email: z.string("Email is required").trim().toLowerCase().min(1, "Email is required"),
  password: z.string("Password is required").min(1, "Password is required"),
});

module.exports = { signupBody, loginBody };
