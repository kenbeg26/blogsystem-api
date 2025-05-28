const express = require('express');
const postController = require('../controllers/post');
console.log(postController); // Should show all methods
const { verify, verifyAdmin } = require("../auth");

//[SECTION] Routing Component
const router = express.Router();

router.post("/", verify, postController.addPost);

router.get("/all", verify, postController.getAllPosts);

router.get("/", verify, postController.getUserPosts);

router.patch("/update/:postId", verify, postController.updatePost);

router.delete("/deletePost/:postId", verify, postController.deletePost);

router.delete("/deleteAnyPost/:postId", verify, verifyAdmin, postController.deletePost);

module.exports = router;