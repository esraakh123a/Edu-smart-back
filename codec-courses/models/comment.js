const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comment: {
        type: String,
        match: [/^[\u0600-\u06FFa-zA-Z0-9\s.,!?'"()\-@]+$/, "Comment contains invalid characters"],
        required: [true, "Comment cannot be empty"],
        minlength: [2, "Comment must be at least 2 characters"],
        maxlength: [300, "Comment cannot exceed 300 characters"]
    },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
