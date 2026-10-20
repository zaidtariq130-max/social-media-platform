const chatbotService = require("../services/chatbot.service");
const { sendSuccess } = require("../utils/response");

// POST /api/chatbot  { message, history? }  ->  { success, reply }
const chat = async (req, res) => {
  const reply = await chatbotService.chat({
    message: req.body.message,
    history: req.body.history,
  });
  return sendSuccess(res, { reply });
};

module.exports = { chat };
