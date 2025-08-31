const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  code: { 
    type: String, 
    unique: true, 
    required: true 
  },

  percentage: { 
    type: Number, 
    min: 0,
    max: 100,
    default: null
  },

  amount: { 
    type: Number, 
    min: 0,
    default: null
  },

  courseIDs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    }
  ],

  expiryDate: { type: Date, required: true },

  minPrice: { 
    type: Number,
    min: 0
  },

  maxUsage: { // أقصى عدد مرات استخدام الكوبون
    type: Number,
    min: 1,
    default: 1
  },

  usedCount: { // عدد مرات الاستخدام الفعلية
    type: Number,
    min: 0,
    default: 0
  }
});

// التحقق قبل حفظ الكوبون
discountSchema.pre("validate", function (next) {
  if (this.percentage === null && this.amount === null) {
    return next(new Error("الإنستركتور لازم يحدد الخصم كنسبة مئوية أو مبلغ ثابت"));
  }
  if (!this.courseIDs || this.courseIDs.length === 0) {
    return next(new Error("الإنستركتور لازم يحدد كورس واحد على الأقل لتطبيق الكوبون"));
  }
  next();
});

module.exports = mongoose.model("Discount", discountSchema);
