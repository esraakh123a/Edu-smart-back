const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const sendCertificateEmail = async ({ to, name, certificatePath }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, 
        pass: process.env.GMAIL_APP_PASSWORD  
      }
    });

    const mailOptions = {
      from: `SmartLearn <${process.env.GMAIL_USER}>`,
      to,
      subject: '🎓 Your Certificate from SmartLearn',
      text: `Dear ${name},\n\nCongratulations on completing your course! Your certificate is attached.\n\nBest regards,\nSmartLearn Team`,
      attachments: [
        {
          filename: 'certificate.pdf',
          path: path.resolve(certificatePath),
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log(` Certificate sent to ${to}`);
  } catch (error) {
    console.error(` Failed to send email:`, error);
  }
};

module.exports = sendCertificateEmail;
