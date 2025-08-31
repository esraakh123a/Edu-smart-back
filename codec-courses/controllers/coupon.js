const Discount = require("../models/coupon");
const Course = require("../models/Course");

// إضافة خصم جديد
const createDiscount = async (req, res) => {
  try {
    const { code, percentage, amount, courseIDs, expiryDate, usageLimit} = req.body;
    const instructorId = req.user._id; // الإنستركتور الحالي

    // تحقق: كل الكورسات موجودة ومملوكة للإنستركتور
    const courses = await Course.find({ _id: { $in: courseIDs }, instructor: instructorId });
    if (courses.length !== courseIDs.length) {
      return res.status(400).json({ error: "Courses not found or not owned by instructor" });
    }

    // تحقق: لازم يحدد نوع خصم
    if (!percentage && !amount) {
      return res.status(400).json({ error: "Percentage or amount is required" });
    }

    const discount = new Discount({
      code,
      percentage: percentage || null,
      amount: amount || null,
      courseIDs,
      expiryDate,
      usageLimit
    });

    await discount.save();
    res.status(201).json(discount);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// عرض كل الخصومات
const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find();
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// عرض خصم واحد
const getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) return res.status(404).json({ error: "Discount not found" });
    res.json(discount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// تعديل خصم
const updateDiscount = async (req, res) => {
  try {
    const { code, percentage, amount, courseIDs, expiryDate } = req.body;
    const discountId = req.params.id;
    const instructorId = req.user._id; // الإنستركتور الحالي

    // البحث عن الكوبون للتأكد إنه موجود
    const discount = await Discount.findById(discountId);
    if (!discount) return res.status(404).json({ error: "Discount not found" });

    // تحقق إن كل الكورسات الجديدة تخص الإنستركتور
    if (courseIDs) {
      const courses = await Course.find({ _id: { $in: courseIDs }, instructor: instructorId });
      if (courses.length !== courseIDs.length) {
        return res.status(400).json({ error: "Courses not found or not owned by instructor" });
      }
      discount.courseIDs = courseIDs;
    }

    // تحديث باقي الحقول
    if (code) discount.code = code;
    if (percentage !== undefined) discount.percentage = percentage;
    if (amount !== undefined) discount.amount = amount;
    if (expiryDate) discount.expiryDate = expiryDate;

    // التأكد من وجود نوع خصم
    if (!discount.percentage && !discount.amount) {
      return res.status(400).json({ error: "Percentage or amount is required" });
    }

    await discount.save();
    res.json(discount);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// حذف خصم
const deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) return res.status(404).json({ error: "Discount not found" });
    res.json({ message: "Discount deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount
};
