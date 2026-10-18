const express = require("express");
const controller = require("../controllers/post.controller");
const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { idParam, pagination } = require("../validators/common.validator");
const { postBody } = require("../validators/post.validator");

const router = express.Router();

router.use(authenticate);

router.post("/", validate({ body: postBody }), controller.createPost);
router.get("/", validate({ query: pagination }), controller.getPosts);
router.put("/:id", validate({ params: idParam, body: postBody }), controller.updatePost);
router.delete("/:id", validate({ params: idParam }), controller.deletePost);

module.exports = router;
