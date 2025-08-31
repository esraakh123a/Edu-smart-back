// rating
const createRating = async (req, res) => {
  try {
    const { courseId, userId, value } = req.body;

    // التحقق من وجود المستخدم والكورس
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ message: 'User or course not found' });
    }

    // التحقق من عدم وجود تقييم مسبق
    const existingRating = await Rating.findOne({ courseId, userId });
    if (existingRating) {
      return res.status(400).json({ message: 'Rating already exists' });
    }

    // إنشاء التقييم الجديد
    const rating = new Rating({ courseId, userId, value });
    await rating.save();

    res.json({ message: 'Rating created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create rating' });
  }
};
const createOrUpdateRating = async (req, res) => {
    try {
      const { courseId, userId, value } = req.body;
  
      // التحقق من وجود المستخدم والكورس
      const user = await User.findById(userId);
      const course = await Course.findById(courseId);
  
      if (!user || !course) {
        return res.status(404).json({ message: 'User or course not found' });
      }
  
      // البحث عن تقييم سابق
      let rating = await Rating.findOne({ courseId, userId });
  
      if (rating) {
        // تحديث التقييم لو موجود
        rating.value = value;
        await rating.save();
      } else {
        // إنشاء التقييم الجديد
        rating = new Rating({ courseId, userId, value });
        await rating.save();
      }
  
      // تحديث متوسط التقييم في الكورس
      const ratings = await Rating.find({ courseId });
      const averageRating = ratings.reduce((sum, rating) => sum + rating.value, 0) / ratings.length;
  
      course.averageRating = parseFloat(averageRating.toFixed(1));
      course.totalRatings = ratings.length;
      await course.save();
  
      res.json({ message: 'Rating saved successfully', averageRating: course.averageRating, totalRatings: course.totalRatings });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to save rating' });
    }
  };

module.exports = {
    createRating,
    createOrUpdateRating
};