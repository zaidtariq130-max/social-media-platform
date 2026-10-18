const { z } = require("zod");
const { PAGINATION } = require("../config/constants");

const objectId = z.string("ID is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const idParam = z.object({ id: objectId });

const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
});

module.exports = { objectId, idParam, pagination };
