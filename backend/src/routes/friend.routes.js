const express = require("express");
const controller = require("../controllers/friend.controller");
const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { idParam } = require("../validators/common.validator");
const { listUsersQuery } = require("../validators/user.validator");
const { sendRequestBody, respondBody, requestsQuery } = require("../validators/friend.validator");

const router = express.Router();

// every friend route is protected
router.use(authenticate);

router.get("/", controller.getFriends);
router.get("/people", validate({ query: listUsersQuery }), controller.getPeople);

// Requests
router.get("/requests", validate({ query: requestsQuery }), controller.getRequests);
router.post("/requests", validate({ body: sendRequestBody }), controller.sendRequest);
router.put(
  "/requests/:id",
  validate({ params: idParam, body: respondBody }),
  controller.respondToRequest
);
router.delete("/requests/:id", validate({ params: idParam }), controller.cancelRequest);

// Unfriend
router.delete("/:id", validate({ params: idParam }), controller.removeFriend);

module.exports = router;
