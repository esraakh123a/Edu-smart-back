const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

async function calculateTotalHours(courseIds) {
    const courses = await Course.find({ _id: { $in: courseIds } });
    let total = 0;
    courses.forEach(c => total += c.estimatedDuration || 0);
    return total;
}

// إنشاء كورس أو باكج
exports.createCourse = async (req, res) => {
    try {
        if (req.body.type === 'course') {
            req.body.instructorID = req.user.id; 
        }

        if (req.body.type === 'package') {
            if (!req.body.package || req.body.package.length === 0) {
                return res.status(400).json({ message: "Package must include courses" });
            }
            req.body.totalHours = await calculateTotalHours(req.body.package);
        }

        const newCourse = new Course(req.body);
        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse); 
    } catch (error) {
        res.status(400).json({ message: error.message }); 
    }
};




exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({ 
            type: 'course',       // فقط كورسات فردية
            // isApproved: true      
        }).limit(10)
        .select('_id title description level language estimatedDuration coverImageURL instructorID price createdAt updatedAt type')
        .populate("instructorID", "name"); // جلب اسم المدرس فقط

        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


    // get Package by id
    exports.getPackageById = async (req, res) => {
        try {
            const packageCourse = await Course.findById(req.params.id); 
            if (!packageCourse || packageCourse.type !== 'package') {
                return res.status(404).json({ message: 'Package not found' }); 
            }
            res.status(200).json(packageCourse);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    exports.getallpackages = async (req, res) => {
        try {
            const packageCourse = await Course.find({ type: 'package' }).populate("instructorID", "name").limit(10); 
            res.status(200).json(packageCourse);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// تحديث كورس أو باكج
exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });

        if (course.type === 'package') {
            ['instructorID', 'categoryID', 'level', 'language', 'estimatedDuration'].forEach(field => delete req.body[field]);

            if (req.body.package && req.body.package.length > 0) {
                req.body.totalHours = await calculateTotalHours(req.body.package);
            }
        }

        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json(updatedCourse);
    } catch (error) {
        res.status(400).json({ message: error.message }); 
    }
};



exports.deleteCourse = async (req, res) => {
    try {
        const deletedCourse = await Course.findByIdAndDelete(req.params.id); // بيبحث ويحذف الكورس
        if (!deletedCourse) {
            return res.status(404).json({ message: 'couress not found' });
        }
        await Lesson.deleteMany({ courseID: req.params.id });
        res.status(200).json({ message: 'delete doneee.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.fixCoursePrices = async (req, res) => {
    try {
        const courses = await Course.find({ type: 'course' });
        let modifiedCount = 0;

        for (let course of courses) {
            try {
                let newPrice = course.price;

                if (newPrice && typeof newPrice === "object" && newPrice.$arrayElemAt) {
                    newPrice = Number(newPrice.$arrayElemAt[1]);
                } else {
                    newPrice = Number(newPrice);
                }

                // فقط لو price مختلف عن الرقم الحالي
                if (course.price !== newPrice) {
                    course.price = newPrice;
                    await course.save();
                    modifiedCount++;
                }
            } catch (err) {
                console.log(`خطأ في تعديل السعر للكورس: ${course.title}`, err.message);
            }
        }

        res.status(200).json({
            message: 'تم تعديل أسعار جميع الكورسات الفردية!',
            modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
