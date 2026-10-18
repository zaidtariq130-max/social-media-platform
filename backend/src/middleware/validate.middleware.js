const AppError = require("../utils/AppError");

/**
 * Validates req.body / req.params / req.query against zod schemas.
 *   router.post("/", validate({ body: createPostSchema }), createPost)
 * Parsed (trimmed, coerced, defaulted) values replace the raw ones.
 * Express 5 makes req.query read-only, so parsed query lives in `req.validatedQuery`.
 */
const validate = (schemas) => (req, res, next) => {
  const issues = [];

  for (const part of ["params", "body", "query"]) {
    if (!schemas[part]) continue;
    const result = schemas[part].safeParse(req[part] ?? {});
    if (!result.success) {
      issues.push(
        ...result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      );
      continue;
    }
    if (part === "query") req.validatedQuery = result.data;
    else req[part] = result.data;
  }

  if (issues.length > 0) {
    // first problem becomes the headline, so simple UIs can just show `message`
    return next(
      new AppError(400, issues[0].message, { detail: issues[0].message, errors: issues })
    );
  }
  return next();
};

module.exports = validate;
