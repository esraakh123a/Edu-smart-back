const mongoose = require('mongoose');

// تعريف الـ Schema (هيكل البيانات) للدرس
const lessonSchema = new mongoose.Schema({
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', // بيربط الدرس بالكورس اللي بينتمي ليه
        required: true,
        validate: {
            validator: async function(value) {
                const course = await mongoose.model('Course').findById(value);
                return course && course.type === 'course';
            },
            message: 'Lesson must belong to a course, not a package'
        }
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    videoURL: {
        type: String,
        required: false
    },
    resources: {
        type: [String], // مصفوفة من النصوص (ممكن تكون روابط أو نصوص لمصادر إضافية)
        default: []     // قيمة افتراضية: مصفوفة فارغة لو مفيش مصادر
    },
    duration: {
        type: Number, // المدة بالدقائق
        required: true
    },
    isPreview: {
        type: Boolean,
        default: false
    },

    // الحقول الجديدة للتحكم في الوصول حسب الكويز
    requiredQuiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz', // ربط الدرس بالكويز المطلوب
        default: null
    },
    requiredScoreForAccess: {
        type: Number,
        default: 0, // الدرجة المطلوبة للتمكن من مشاهدة الدرس
        min: 0,
        max: 100
    }

}, {
    timestamps: true 
});

module.exports = mongoose.model('Lesson', lessonSchema);
