const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Regex للاسم: حروف عربية أو إنجليزية + مسافة واحدة بين الكلمات + مسموح الشرطة (-) أو الأبوستروف (')
const NAME_REGEX = /^(?=.{2,50}$)(?!.*\s{2,})(?!.*[-']{2,})(?!.*^[\s-'])(?!.*[\s-']$)[A-Za-z\u0600-\u06FF]+(?:[ '-][A-Za-z\u0600-\u06FF]+)*$/;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [50, "Name must be less than 50 characters"],
    validate: {
      validator: v => NAME_REGEX.test(v),
      message:
        "Name must contain only Arabic/English letters, single spaces between words, and no numbers or special symbols."
    },
    set: v =>
      String(v || "")
        .normalize("NFKC")
        .replace(/\s+/g, " ")
        .replace(/^[\s-']+|[\s-']+$/g, "")
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
      "Please enter a valid email"
    ]
  },
  password: {
  type: String,
  required: function() { return !this.resetOTP; }, // مطلوب بس لو مفيش OTP
  minlength: 8,
  validate: {
    validator: function (value) {
      if (!value) return true; // لو فاضي ومافيش OTP ما نطبقش regex
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
    },
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
  }
  },
  phonenumber: {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^01[0-2,5]{1}[0-9]{8}$/, "Please enter a valid Egyptian phone number"]
  },
  city: {
    type: String,
    required: [true, "City is required"]
  },
  role: {
    type: String,
    enum: ["student", "instructor", "admin"],
    default: "student"
  }, resetOTP: String,
resetOTPExpire: Date,
  // حالة الـ instructor
  isActive: {
    type: Boolean,
    default: false // أو true لو عايزة يبقى نشط تلقائيًا
  },
  isApproved: {
    type: Boolean,
    default: false,
    required: function () {
      // مطلوب فقط لو الدور instructor
      return this.role === "instructor";
    }
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', 
    required: function () {
      // مطلوب فقط لو الدور instructor
      return this.role === "instructor";
    }
  },
  approvalDate: { type: Date  ,
    required: function () {
      // مطلوب فقط لو الدور instructor
      return this.status === "approved";
    }
  },
  certificateURL: {
    type: String,
    // required: function () {
    //   // مطلوب فقط لو الدور instructor
    //   return this.role === "instructor";
    // }
  },
  preferences: {
    language: { type: String, default: "en" },
    darkMode: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true }
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);

