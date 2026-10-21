const { z } = require("zod");
const { objectId } = require("./common.validator");

const sendRequestBody = z.object({ userId: objectId });

const respondBody = z.object({
  action: z.enum(["accept", "decline"], "Action must be accept or decline"),
});

const requestsQuery = z.object({
  type: z.enum(["incoming", "outgoing"]).default("incoming"),
});

module.exports = { sendRequestBody, respondBody, requestsQuery };
