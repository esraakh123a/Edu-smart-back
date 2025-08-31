//Multiple Choice)   نوع الاسئلة 


// multiple_choice_single → اختيار إجابة واحدة.

//  استيراد مكتبة Joi لعمل Validation (التحقق من صحة الداتا القادمة من الـ request)
const Joi = require('joi');


// ============================== سكيما التحقق للكويز ==============================
// هنا بنبني شكل البيانات الصحيحة المتوقعة لعمل كويز جديد أو تحديثه
const quizSchema = Joi.object({
  // العنوان لازم يكون String، بنشيل المسافات الزيادة من الطرفين بـ trim، و required يعني وجوده إجباري
  title: Joi.string().trim().required().messages({
    // 'string.empty' = النص موجود بس فاضي "" → نرجّع رسالة مفهومة للمستخدم
    'string.empty': 'Quiz title is required',
    // 'any.required' = المفتاح نفسه title مش موجود خالص في الـ body
    'any.required': 'Quiz title is required'
  }),

  // questions: مصفوفة من الأسئلة، كل عنصر فيها لازم يطابق السكيما اللي تحت (Joi.object({...}))
  // خليتها optional عشان تقدر تعملي كويز بالعُنوان بس وتضيفي الأسئلة لاحقًا
  questions: Joi.array().items(
    Joi.object({
      // نص السؤال: نص مطلوب + trim لتنضيف المسافات
      text: Joi.string().trim().required().messages({
        'string.empty': 'Question text is required'
      }),

      // الخيارات: مصفوفة من Strings متشطّبة، لازم يكون فيها على الأقل خيارين
      options: Joi.array().items(Joi.string().trim()).min(2).required().messages({
        'array.min': 'A question must have at least two options'
      }),

      // الإجابة الصحيحة: نص مطلوب ولازم يكون واحد من عناصر options
      correctAnswer: Joi.string().trim().required().custom((value, helpers) => {
        // helpers.state.ancestors[0] = بترجع كائن السؤال الحالي أثناء التحقق
        const { options } = helpers.state.ancestors[0];

        // لو القيمة اللي جت في correctAnswer مش موجودة جوّه options → نرمي رسالة خطأ واضحة
        if (!options.includes(value)) {
          return helpers.message('The correct answer must be one of the provided options');
        }
        // رجّع القيمة زي ما هي لو التحقق نجح
        return value;
      }).messages({
        'any.required': 'Correct answer is required'
      })
    })
  ).optional()
});
// ===============================================================================


// ============================== سكيما لإضافة/تحديث سؤال واحد ==============================
// هنستخدمها في endpoints الخاصة بإضافة سؤال أو تحديث سؤال داخل كويز
const questionSchema = Joi.object({
  text: Joi.string().trim().required().messages({
    'string.empty': 'Question text is required'
  }),
  options: Joi.array().items(Joi.string().trim()).min(2).required().messages({
    'array.min': 'A question must have at least two options'
  }),
  correctAnswer: Joi.string().trim().required().custom((value, helpers) => {
    const { options } = helpers.state.ancestors[0];
    if (!options.includes(value)) {
      return helpers.message('The correct answer must be one of the provided options');
    }
    return value;
  }).messages({
    'any.required': 'Correct answer is required'
  })
});
// ===============================================================================


// ============================== إنشاء كويز جديد ==============================
// POST /quizzes
exports.createQuiz = async (req, res) => {
  try {
    // بنعمل validate على الـ body كله حسب quizSchema
    // abortEarly: false → رجّع كل الأخطاء مرة واحدة بدل ما توقف عند أول خطأ
    const { error } = quizSchema.validate(req.body, { abortEarly: false });

    // لو فيه أخطاء تحقق → رجّع 400 مع قائمة رسائل الأخطاء
    if (error) {
      return res.status(400).json({
        message: 'Invalid data',
        errors: error.details.map(err => err.message)
      });
    }

    // بنفك الداتا من الـ body
    const { title, questions } = req.body;

    // بنبني كائن Quiz جديد (ده بيطابق الـ schema بتاعة Mongoose)
    const quiz = new Quiz({
      title,
      // لو questions مش مبعوتة، خليك آمن وخليها مصفوفة فاضية
      questions: questions || [],
      // createdBy: لو عندك ميدلوير Auth بيحط req.user يبقى نسجّل الـ _id
      createdBy: req.user ? req.user._id : null
    });

    // احفظ في الداتابيز
    await quiz.save();

    // الرد بنجاح 201 Created ومعاه الكويز اللي اتعمل
    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    // أي خطأ غير متوقع (DB/Runtime) → رجّع 400 برسالة مفصلة
    res.status(400).json({ message: 'Error while creating quiz', error: error.message });
  }
};
// ===============================================================================


// ============================== جلب جميع الكويزات ==============================
// GET /quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    // .find() تجيب كل الكويزات
    // .populate('createdBy', 'username') → هات فقط حقل username من المستخدم المنشئ
    const quizzes = await Quiz.find().populate('createdBy', 'username');

    // رجّع 200 مع المصفوفة
    res.status(200).json(quizzes);
  } catch (error) {
    // لو حصل خطأ (اتصال بالداتابيز مثلًا) → 500
    res.status(500).json({ message: 'Error while fetching quizzes', error: error.message });
  }
};
// ===============================================================================


// ============================== جلب كويز معين بالـ id ==============================
// GET /quizzes/:id
exports.getQuizById = async (req, res) => {
  try {
    // req.params.id = الـ id اللي في مسار الرابط
    const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'username');

    // لو مش لاقي الكويز → 404
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // رجّع الكويز
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error while fetching quiz', error: error.message });
  }
};
// ===============================================================================


// ============================== تحديث كويز ==============================
// PUT /quizzes/:id
exports.updateQuiz = async (req, res) => {
  try {
    // allowUnknown: true → لو فيه حقول إضافية مش معرفة في Joi متكسرش، بس احنا مش هنخزنها إلا لو حطيناها صراحة
    const { error } = quizSchema.validate(req.body, { abortEarly: false, allowUnknown: true });

    if (error) {
      return res.status(400).json({
        message: 'Invalid data',
        errors: error.details.map(err => err.message)
      });
    }

    // جيبي الكويز الأول عشان نعدّل عليه
    const { title, questions } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    // لو مش موجود → 404
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // حدّث بس الحقول اللي جاية (حماية من مسح غير مقصود)
    if (title) quiz.title = title;
    if (questions) quiz.questions = questions;

    // احفظ التعديلات
    await quiz.save();

    res.status(200).json({ message: 'Quiz updated successfully', quiz });
  } catch (error) {
    res.status(400).json({ message: 'Error while updating quiz', error: error.message });
  }
};
// ===============================================================================


// ============================== حذف كويز ==============================
// DELETE /quizzes/:id
exports.deleteQuiz = async (req, res) => {
  try {
    // احذف الكويز مباشرةً ورجّع النسخة المحذوفة جوّه المتغيّر quiz
    const quiz = await Quiz.findByIdAndDelete(req.params.id);

    // لو مش موجود → 404
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // بعد ما اتمسح الكويز: فضّي مرجع quizId في أي درس كان مربوط بيه
    // updateMany({ quizId: quiz._id }, { $set: { quizId: null } }) → يحافظ على تكامل البيانات
    await Lesson.updateMany({ quizId: quiz._id }, { $set: { quizId: null } });

    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error while deleting quiz', error: error.message });
  }
};
// ===============================================================================


// ============================== إضافة سؤال إلى كويز ==============================
// POST /quizzes/:id/questions
exports.addQuestionToQuiz = async (req, res) => {
  try {
    // تحقق من شكل السؤال المرسل في body
    const { error } = questionSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: 'Invalid data',
        errors: error.details.map(err => err.message)
      });
    }

    // فكّك السؤال
    const { text, options, correctAnswer } = req.body;

    // هات الكويز اللي هنضيف له السؤال
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // ضيف السؤال للمصفوفة
    quiz.questions.push({ text, options, correctAnswer });

    // احفظ
    await quiz.save();

    res.status(201).json({ message: 'Question added successfully', quiz });
  } catch (error) {
    res.status(400).json({ message: 'Error while adding question', error: error.message });
  }
};
// ===============================================================================


// ============================== تحديث سؤال داخل كويز ==============================
// PUT /quizzes/:id/questions/:questionIndex
exports.updateQuestionInQuiz = async (req, res) => {
  try {
    // تحقّق من جسم السؤال الجديد
    const { error } = questionSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: 'Invalid data',
        errors: error.details.map(err => err.message)
      });
    }

    // خدي القيم الجديدة + id الكويز + رقم السؤال من الـ params
    const { text, options, correctAnswer } = req.body;
    const { id, questionIndex } = req.params;

    // ملاحظة: questionIndex بيكون String من الـ URL، جافاسكربت بتحوّله تلقائيًا لمؤشر رقمي في المصفوفة
    // بس الأفضل في مشروع كبير تعملي: const idx = Number(questionIndex); والتحقق إنه رقم صالح
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // تأكدي إن المؤشر موجود داخل المصفوفة
    if (!quiz.questions[questionIndex]) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // استبدلي السؤال بالكامل بالقيم الجديدة
    quiz.questions[questionIndex] = { text, options, correctAnswer };

    // احفظ
    await quiz.save();

    res.status(200).json({ message: 'Question updated successfully', quiz });
  } catch (error) {
    res.status(400).json({ message: 'Error while updating question', error: error.message });
  }
};
// ===============================================================================


// ============================== حذف سؤال من كويز ==============================
// DELETE /quizzes/:id/questions/:questionIndex
exports.deleteQuestionFromQuiz = async (req, res) => {
  try {
    const { id, questionIndex } = req.params;

    // هات الكويز
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // تأكدي إن السؤال موجود
    if (!quiz.questions[questionIndex]) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // احذفلي عنصر واحد عند الموضع المحدد
    quiz.questions.splice(questionIndex, 1);

    // احفظ
    await quiz.save();

    res.status(200).json({ message: 'Question deleted successfully', quiz });
  } catch (error) {
    res.status(500).json({ message: 'Error while deleting question', error: error.message });
  }
};
// ===============================================================================

