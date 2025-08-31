const mongoose = require('mongoose');
const Course = require('../models/Course');

const searchAll = async (req, res) => {
  try {
    const { query, type, categoryID } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const regex = new RegExp(query, 'i');

    // فلتر الكورسات
    const courseFilter = { $and: [{ $or: [{ title: regex }, { description: regex }] }] };

    if (categoryID) {
      if (categoryID) {
        courseFilter.$and.push({ categoryID });
      }
    }

    const courses = type === 'package' ? [] : await Course.find(courseFilter);

    // فلتر الباكدجز
    let packages = [];
    if (!type || type === 'package') {
      const packageFilter = { $and: [{ $or: [{ title: regex }, { description: regex }] }, { type: 'package' }] };

      if (categoryID) {
        if (categoryID) {
          packageFilter.$and.push({ categoryID });
        }
      }

      packages = await Course.find(packageFilter);
    }

    res.status(200).json({
      message: "Search results",
      data: { courses, packages }
    });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

module.exports = { searchAll };
