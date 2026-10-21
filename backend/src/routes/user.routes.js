const express = require("express");
const controller = require("../controllers/user.controller");
const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { listUsersQuery, usernameParams } = require("../validators/user.validator");

const router = express.Router();

// protected: only logged-in users can list others
router.get("/", authenticate, validate({ query: listUsersQuery }), controller.getUsers);

router.get("/me/stats", authenticate, controller.getMyStats);

router.get(
  "/by-username/:username",
  authenticate,
  validate({ params: usernameParams }),
  controller.getUserByUsername
);

module.exports = router;
