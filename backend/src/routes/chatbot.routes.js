const express = require("express");
const controller = require("../controllers/chatbot.controller");
const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { chatbotLimiter } = require("../middleware/chatbotLimiter");
const { chatBody } = require("../validators/chatbot.validator");

const router = express.Router();

// only logged-in users may use the bot (it costs API quota)
router.use(authenticate);

router.post("/", chatbotLimiter, validate({ body: chatBody }), controller.chat);

module.exports = router;
