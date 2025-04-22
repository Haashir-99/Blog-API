const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    replies: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Reply",
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
