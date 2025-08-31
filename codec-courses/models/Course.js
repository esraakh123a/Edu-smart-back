const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['course', 'package'],
        default: 'course',
        required: true
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    instructorID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: function() { return this.type === 'course'; }
    },
    isApproved: { type: Boolean, default: false , 
        required: function() { return this.type === 'course'; }
    } ,
    categoryID: { type: String},

    price: { type: Number, required: true },
    originalPrice: { type: Number },
    isFree: { type: Boolean, default: false },

    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'], 
        required: function() { return this.type === 'course'; }
    },

    language: {
        type: String,
        trim: true,
        required: function() { return this.type === 'course'; }
    },

    estimatedDuration: {
        type: Number, 
        required: function() { return this.type === 'course'; }
    },

    coverImageURL: { type: String },

    // لو package يحوي كورسات
    package:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: function() { return this.type === 'package'; } }],

    // الكويزات الخاصة بالكورس
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],

    // خصم مباشر للبكچ فقط
    discountPercentage: { 
        type: Number,
        min: 0,
        max: 100,
        required: function() { return this.type === 'package'; }
    },

    // الطلبة المسجلين
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: function() { return this.type === 'package'; } }],

    // المهارات المفتاحية
    keySkills: [{ type: String, required: function() { return this.type === 'package'; } }],

    // المسارات الوظيفية
    careerPaths: [{ type: String, required: function() { return this.type === 'package'; } }],
    totalHours: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
