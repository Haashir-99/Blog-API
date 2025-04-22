const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: {
      type: String,
      default: "Untitled Post",
    },
    slug: {
      type: String,
      default: "untitled-post",
    },
    content: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    gallery: {
      type: [String],
      default: [],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: null,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Comment",
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "draft", // "draft", "published", or "archived"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
