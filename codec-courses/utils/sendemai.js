const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    console.log("📧 Preparing to send email to:", options.email);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    console.log("✅ SMTP transporter created successfully");

    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    console.log("📨 Email message prepared:", message);

    const info = await transporter.sendMail(message);

    console.log("✅ Email sent successfully:", info.response);

    return info; // نرجع نتيجة الإرسال عشان الكنترولر يعرف

  } catch (error) {
    console.error("❌ Error sending email:", error);

    // نرمي الخطأ عشان الكنترولر يمسكه ويعرضه في Postman
    throw new Error(error.message || "Email sending failed");
  }
};

module.exports = sendEmail;
