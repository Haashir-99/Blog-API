const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");

const postController = require("../controllers/post");
const authenticateJwt = require("../middleware/auth");
const validateRequest = require("../middleware/validation");

// Post E ndpoints

// GET posts
router.get("/posts", postController.getPosts);

// GET post/:id
router.get(
  "/post/:id",
  authenticateJwt,
  [param("id").isMongoId().withMessage("Invalid post ID")],
  postController.getPost
);

// GET posts for a specific user
router.get("/user/posts", authenticateJwt, postController.getUserPosts);

// POST post
router.post(
  "/post",
  authenticateJwt,
  validateRequest,
  postController.createPost
);

// PUT post/:id
router.put(
  "/post/:id",
  authenticateJwt,
  [
    body("title")
      .optional()
      .isLength({ min: 5 })
      .withMessage("Title must be at least 5 characters long"),
    body("slug"),
    body("content"),
    body("description"),
    body("coverImage")
      .optional()
      .isURL()
      .withMessage("Cover image must be a valid URL"),
    body("gallery")
      .optional()
      .isArray()
      .withMessage("Gallery must be an array"),
    body("gallery.*")
      .optional()
      .isURL()
      .withMessage("Gallery images must be valid URLs"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("category").optional(),
    param("id").isMongoId().withMessage("Invalid post ID"),
  ],
  validateRequest,
  postController.putPost
);

// DELETE post/:id
router.delete(
  "/post/:id",
  authenticateJwt,
  [param("id").isMongoId().withMessage("Invalid post ID")],
  validateRequest,
  postController.deletePost
);

// Comments Endpoints

// GET post/:id/comments -- GET all comments for a post
router.get(
  "/post/:id/comments",
  [param("id").isMongoId().withMessage("Invalid post ID")],
  validateRequest,
  postController.getPostComments
);

// GET post/:id/comments/:commentId -- GET a specific comment
router.get(
  "/post/:id/comments/:commentId",
  [
    param("id").isMongoId().withMessage("Invalid post ID"),
    param("commentId").isMongoId().withMessage("Invalid comment ID"),
  ],
  validateRequest,
  postController.getPostComment
);

// POST post/:id/comments -- POST a comment
router.post(
  "/post/:id/comments",
  authenticateJwt,
  [
    body("content")
      .isString()
      .withMessage("Content must be a string")
      .notEmpty()
      .withMessage("Content is required"),
    param("id").isMongoId().withMessage("Invalid post ID"),
  ],
  validateRequest,
  postController.createPostComment
);

// PUT post/:id/comments/:commentId -- PUT a comment
router.put(
  "/post/:id/comments/:commentId",
  authenticateJwt,
  [
    param("id").isMongoId().withMessage("Invalid post ID"),
    param("commentId").isMongoId().withMessage("Invalid comment ID"),
  ],
  validateRequest,
  postController.putPostComment
);

// DELETE post/:id/comments/:commentId -- DELETE a comment
router.delete(
  "/post/:id/comments/:commentId",
  authenticateJwt,
  [
    param("id").isMongoId().withMessage("Invalid post ID"),
    param("commentId").isMongoId().withMessage("Invalid comment ID"),
  ],
  validateRequest,
  postController.deletePostComment
);

// Comment Replies Endpoints

// GET comment/:commentId/replies -- GET all replies for a comment
router.get(
  "/comment/:commentId/replies",
  [param("commentId").isMongoId().withMessage("Invalid comment ID")],
  validateRequest,
  postController.getPostCommentReplies
);

// POST comments/:commentId/replies -- POST a reply
router.post(
  "/comment/:commentId/replies",
  authenticateJwt,
  [
    body("content")
      .isString()
      .withMessage("Content must be a string")
      .notEmpty()
      .withMessage("Content is required"),
    param("commentId").isMongoId().withMessage("Invalid comment ID"),
  ],
  validateRequest,
  postController.createPostCommentReply
);

// PUT comment/:commentId/replies/:replyId -- PUT a reply
router.put(
  "/comment/:commentId/replies/:replyId",
  authenticateJwt,
  [
    param("commentId").isMongoId().withMessage("Invalid comment ID"),
    param("replyId").isMongoId().withMessage("Invalid reply ID"),
  ],
  validateRequest,
  postController.putPostCommentReply
);

// DELETE comment/:commentId/replies/:replyId -- DELETE a reply
router.delete(
  "/comment/:commentId/replies/:replyId",
  authenticateJwt,
  [
    param("commentId").isMongoId().withMessage("Invalid comment ID"),
    param("replyId").isMongoId().withMessage("Invalid reply ID"),
  ],
  validateRequest,
  postController.deletePostCommentReply
);

// POST posts/:id/like

// DELETE posts/:id/like

// POST posts/:id/save

// DELETE posts/:id/save

module.exports = router;
