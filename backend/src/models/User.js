const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { AUTH } = require("../config/constants");

// One entry per logged-in device. Only a SHA-256 hash of the refresh token is stored.
const sessionSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    // set when the token has been rotated; used for the short reuse grace window
    replacedAt: { type: Date, default: null },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    refreshSessions: { type: [sessionSchema], default: [], select: false },
  },
  { timestamps: true }
);

// Usernames are unique regardless of case ("Ali" == "ali"). The collation must match
// the one used in the lookups in auth.service / user.service so the index is used.
userSchema.index({ username: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

// Hash on save, so no controller/service ever has to remember to do it.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, AUTH.BCRYPT_ROUNDS);
});

/** Needs the document to be loaded with `.select("+password")`. */
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
