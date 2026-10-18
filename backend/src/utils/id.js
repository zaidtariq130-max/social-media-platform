const mongoose = require("mongoose");
const AppError = require("./AppError");

/** Returns the string id of a document, an ObjectId or a populated doc. */
const idOf = (value) => (value && value._id ? value._id : value).toString();

const isValidId = (id) => mongoose.isValidObjectId(id);

const assertValidId = (id) => {
  if (!isValidId(id)) throw new AppError(400, "Invalid ID");
};

/** Same key for (a, b) and (b, a): identifies the 1-to-1 chat between two users. */
const directKeyOf = (a, b) => [String(a), String(b)].sort().join(":");

module.exports = { idOf, isValidId, assertValidId, directKeyOf };
