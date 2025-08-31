// Sort and filter controller
const Course = require('../models/Course');

const sort_and_filter = async (req, res) => {
  try {
    const {
      category,
      level,
      language,
      minRating,
      maxRating,
      maxPrice,
      isFree,
      durationMin,
      durationMax,
      sort
    } = req.query;

    let filter = {};

    // 🔹 Categories (multiple values)
    if (category) {
      const categories = category.split(','); // e.g. ?category=Web,Design
      filter.categoryID = { $in: categories };
    }

    // 🔹 Level
    if (level) filter.level = level;

    // 🔹 Languages (multiple values)
    if (language) {
      const langs = language.split(',');
      filter.language = { $in: langs };
    }

    // 🔹 Rating
    if (minRating || maxRating) {
      filter.rating = {};
      if (minRating) filter.rating.$gte = Number(minRating);
      if (maxRating) filter.rating.$lte = Number(maxRating);
    }

    // 🔹 Price filter
    if (isFree === 'true' && maxPrice) {
      filter.$or = [
        { price: 0 },
        { price: { $lte: Number(maxPrice) } }
      ];
    } else if (isFree === 'true') {
      filter.price = 0;
    } else if (maxPrice) {
      filter.price = { $lte: Number(maxPrice) };
    }

    // 🔹 Duration
    if (durationMin || durationMax) {
      filter.duration = {};
      if (durationMin) filter.duration.$gte = Number(durationMin);
      if (durationMax) filter.duration.$lte = Number(durationMax);
    }

    // 🔹 Sorting
    let sortOption = {};
    switch (sort) {
      case 'highestRated':
        sortOption.rating = -1;
        break;
      case 'newest':
        sortOption.createdAt = -1;
        break;
      case 'priceLowHigh':
        sortOption.price = 1;
        break;
      case 'priceHighLow':
        sortOption.price = -1;
        break;
      default:
        sortOption.createdAt = -1; // fallback
    }

    // 🔹 Execute query
    const courses = await Course.find(filter)
      .sort(sortOption)
      .populate('instructorID', 'name');

    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
};

module.exports = {
  sort_and_filter
};
