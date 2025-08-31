// comment
const User = require('../models/User');
const Course = require('../models/Course');
const Comment = require('../models/comment');
const Rating = require('../models/Rating');
const createComment = async (req, res) => {
    try {
        const { courseId, userId, comment } = req.body;

        // التحقق من وجود المستخدم والكورس
        const user = await User.findById(userId);
        const course = await Course.findById(courseId);

        if (!user || !course) {
            return res.status(404).json({ message: 'User or course not found' });
        }

        // التحقق من عدم وجود تعليق مسبق
        const existingComment = await Comment.findOne({ courseId, userId });
        if (existingComment) {
            return res.status(400).json({ message: 'Comment already exists' });
        }

        // إنشاء التعليق الجديد
        const comments = new Comment({ courseId, userId, comment });
        await comments.save();

        res.json({ message: 'Comment created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create comment' });
    }
};
// get comments with filter & sort
const getComments = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { sort } = req.query; // sort=latest | sort=highest

        let sortOption = {};
        if (sort === 'latest') {
            sortOption = { createdAt: -1 }; // الأحدث أولاً
        } else if (sort === 'highest') {
            // الترتيب بالأعلى تقييم (نجلب من rating)
            sortOption = { 'rating.value': -1, createdAt: -1 };
        }

        const comments = await Comment.find({ courseId })
            .populate('userId', 'name') // جلب اسم المستخدم
            .sort(sortOption);

        res.json({ comments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch comments' });
    }
};


module.exports = {
    createComment,
    getComments
};
