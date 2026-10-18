const { z } = require("zod");
const { LIMITS, CHAT } = require("../config/constants");
const { objectId } = require("./common.validator");

const createConversationBody = z.object({
  participantId: objectId,
});

const createGroupBody = z.object({
  name: z.string().trim().max(LIMITS.GROUP_NAME_MAX).optional(),
  participantIds: z
    .array(objectId, "participantIds must be a list")
    .min(1, "At least one other participant is required")
    .max(LIMITS.GROUP_MEMBERS_MAX, `A group can have at most ${LIMITS.GROUP_MEMBERS_MAX} members`),
});

const sendMessageBody = z.object({
  text: z
    .string("Message text is required")
    .trim()
    .min(1, "Message text is required")
    .max(LIMITS.MESSAGE_MAX, `Message is too long (max ${LIMITS.MESSAGE_MAX} characters)`),
});

const messageParams = z.object({ id: objectId, messageId: objectId });

const listMessagesQuery = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(CHAT.DEFAULT_PAGE_SIZE),
  // return messages older than this ISO date (for "load older" scrolling)
  before: z.coerce.date().optional(),
});

module.exports = {
  createConversationBody,
  createGroupBody,
  sendMessageBody,
  messageParams,
  listMessagesQuery,
};
