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
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, { 
  timestamps: true 
});

// شرط: لازم يكون courseId أو packageId موجود، مش الاتنين فاضيين
enrollmentSchema.pre("validate", function(next) {
  if (!this.courseId && !this.packageId) {
    return next(new Error("Either courseId or packageId is required"));
  }
  next();
});

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
module.exports = Enrollment;
