const express = require('express');
const commentController = require('../controllers/comment');
console.log(commentController); // Should show all methods
const { verify, verifyAdmin } = require("../auth");

//[SECTION] Routing Component
const router = express.Router();

router.post("/:postId", verify, commentController.addComment);

router.get("/:postId", verify, commentController.getComment);

module.exports = router;