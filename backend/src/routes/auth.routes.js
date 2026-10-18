const express = require("express");
const controller = require("../controllers/auth.controller");
const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { authLimiter, refreshLimiter } = require("../middleware/rateLimiters");
const requireAllowedOrigin = require("../middleware/sameOrigin.middleware");
const { signupBody, loginBody } = require("../validators/auth.validator");

const router = express.Router();

router.post("/signup", authLimiter, validate({ body: signupBody }), controller.signup);
router.post("/login", authLimiter, validate({ body: loginBody }), controller.login);
router.post("/refresh", refreshLimiter, requireAllowedOrigin, controller.refresh);
router.post("/logout", requireAllowedOrigin, controller.logout);
router.get("/profile", authenticate, controller.profile);

module.exports = router;
