const mongoose = require("mongoose");
const enrollmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course" 
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  completedLessons: [
    {
      lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
      completedAt: { type: Date, default: Date.now },
      progressInLesson: { type: Number, default: 100 } 
      // لو فيديو: ممكن يبقى < 100 لو وقف قبل ما يخلص
    }
  ],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, { 
  timestamps: true 
});

// شرط: لازم يكون courseId أو packageId موجود
enrollmentSchema.pre("validate", function(next) {
  if (!this.courseId && !this.packageId) {
    return next(new Error("Either courseId or packageId is required"));
  }
  next();
});

// method لحساب progress تلقائي
enrollmentSchema.methods.updateProgress = async function(courseTotalLessons) {
  const completedCount = this.completedLessons.length;
  this.progress = Math.round((completedCount / courseTotalLessons) * 100);
  await this.save();
  return this.progress;
};

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
module.exports = Enrollment;
