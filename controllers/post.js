const Post = require("../models/post");
const Comment = require("../models/comment");
const Reply = require("../models/reply");
const post = require("../models/post");

// Insert url for default cover image in post model

exports.getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 2;
    const skip = (page - 1) * limit;

    const posts = await Post.find().skip(skip).limit(limit).lean().exec();

    res.json({ posts });
  } catch (err) {
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).lean().exec();

    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({ post });
  } catch (err) {
    next(err);
  }
};

exports.getUserPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 2;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: req.user._id })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const post = new Post({ author: req.user._id });
    await post.save();

    res.status(201).json({ message: "Post created", post });
  } catch (err) {
    next(err);
  }
};

exports.putPost = async (req, res, next) => {
  const postId = req.params.id;
  const updates = {
    title: req.body.title,
    slug: req.body.slug || req.body.title,
    content: req.body.content,
    description: req.body.description,
    coverImage: req.body.coverImage,
    gallery: req.body.gallery,
    tags: req.body.tags,
    category: req.body.category,
    status: req.body.status,
  };

  try {
    const post = await Post.findOneAndUpdate(
      { _id: postId, author: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ message: "Post updated", post });
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;

    const post = await Post.findByIdAndDelete(postId);

    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }
    console.log(post);

    res.status(200).json({ message: "Post successfully deleted" });
  } catch (error) {
    next(error);
  }
};

// Comments CRUD operations

exports.getPostComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 2;
    const skip = (page - 1) * limit;
    const comments = await Comment.find({ post: req.params.id })
      .skip(skip)
      .limit(limit);

    if (!comments) {
      const error = new Error("Comments not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({ comments });
  } catch (err) {
    next(err);
  }
};

exports.getPostComment = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content) {
      const error = new Error("Content is required");
      error.statusCode = 422;
      throw error;
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      const error = new Error("Comment not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      comment: comment,
    });
  } catch (error) {
    next(error);
  }
};

exports.createPostComment = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const user = req.user;

    if (!content) {
      const error = new Error("Content is required");
      error.statusCode = 422;
      throw error;
    }

    const comment = new Comment({
      post: postId,
      userId: user._id,
      content: content,
    });

    const savedComment = await comment.save();

    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      throw error;
    }

    post.comments.push(savedComment._id);
    await post.save();

    res.status(201).json({
      message: "Comment created successfully",
      comment: savedComment,
    });
  } catch (error) {
    next(error);
  }
};

exports.putPostComment = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content) {
      const error = new Error("Content is required");
      error.statusCode = 422;
      throw error;
    }

    const post = await Post.findOne({
      _id: req.params.id,
      comments: {
        $in: [req.params.commentId],
      },
    });

    if (!post) {
      const error = new Error("Post or comment not found");
      error.statusCode = 404;
      throw error;
    }

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      const error = new Error("Comment not found");
      error.statusCode = 404;
      throw error;
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      const error = new Error("You cannot edit someone else's comment");
      error.statusCode = 401;
      throw error;
    }

    comment.content = content;
    await comment.save();

    res.status(200).json({
      message: "Comment updated successfully",
      comment: comment,
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePostComment = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      comments: {
        $in: [req.params.commentId],
      },
    });

    if (!post) {
      const error = new Error("Post or comment not found");
      error.statusCode = 404;
      throw error;
    }

    if (post.author.toString() !== req.user._id.toString()) {
      const error = new Error("You cannot delete someone else's comment");
      error.statusCode = 401;
      throw error;
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    post.comments.pull(req.params.commentId);

    await post.save();

    res.status(200).json({
      message: "Comment Deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Comments Replies CRUD operations

exports.getPostCommentReplies = async (req, res, next) => {
  const { commentId } = req.params;

  try {
    const replies = await Reply.find({ commentId: commentId });

    if (!replies) {
      const error = new Error("Replies not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ replies });
  } catch (err) {
    next(err);
  }
};

exports.createPostCommentReply = async (req, res, next) => {
  const { content } = req.body;
  const { commentId } = req.params;

  try {
    if (!content) {
      const error = new Error("Content is required");
      error.statusCode = 422;
      throw error;
    }

    const comment = await Comment.findOne({ _id: commentId });

    if (!comment) {
      const error = new Error("Reply not found");
      error.statusCode = 404;
      throw error;
    }

    const reply = new Reply({
      commentId: commentId,
      userId: req.user._id,
      content,
    });

    const savedReply = await reply.save();

    comment.replies.push(savedReply._id);
    await comment.save();

    res.json({
      message: "Reply added successfully",
      savedReply,
    });
  } catch (err) {
    next(err);
  }
};

exports.putPostCommentReply = async (req, res, next) => {
  const { content } = req.body;
  const { commentId, replyId } = req.params;

  try {
    if (!content) {
      const error = new Error("Content is required");
      error.statusCode = 422;
      throw error;
    }

    const reply = await Reply.findOneAndUpdate(
      { _id: replyId, commentId: commentId },
      { $set: { content } },
      { new: true, runValidators: true }
    );

    if (!reply) {
      const error = new Error("Reply not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({
      message: "Reply updated successfully",
      reply,
    });
  } catch (err) {
    next(err);
  }
};

exports.deletePostCommentReply = async (req, res, next) => {
  const { commentId, replyId } = req.params;

  try {
    const reply = await Reply.findOneAndDelete({
      userId: req.user._id,
      _id: replyId,
      commentId: commentId,
    });

    if (!reply) {
      const error = new Error("Reply not found");
      error.statusCode = 404;
      throw error;
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      const error = new Error("Comment not found");
      error.statusCode = 404;
      throw error;
    }

    comment.replies.pull(reply._id);
    await comment.save();

    res.json({
      message: "Reply updated successfully",
      reply,
    });
  } catch (err) {
    next(err);
  }
};
