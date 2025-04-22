const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const replySchema = new Schema({
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
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
}); 

module.exports = mongoose.model("Reply", replySchema);