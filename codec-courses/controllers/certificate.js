const Enrollment = require('../models/Enrollments');
const certificate = require('../models/certificate');
const generatePDF = require('../utils/generatePDF');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const sendCertificateEmail = require('../utils/sendEmail');
const issueCertificate = async (req, res) => {
  try {
    const { courseId, userId, email, name } = req.body;
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId: userId, courseId: courseId },
      { isCompleted: true },
      { new: true, upsert: true }
    );
    if (!enrollment || !enrollment.isCompleted) {
      return res.status(403).json({ message: 'User has not completed the course.' });
    }

    const existing = await certificate.findOne({ userId: userId, courseId: courseId });
    if (existing) {
      return res.status(200).json({ message: 'Certificate already issued.', url: existing.certificateURL });
    }
    const certId = uuidv4();
    const certificateFileName = `${certId}.pdf`;
    const certificatePath = path.join(__dirname, '..', 'public', 'certificates', certificateFileName);
    const certificateURL = `${process.env.BASE_URL}/certificates/${certificateFileName}`;
    const newCertificate = new certificate({
      userId: userId,
      courseId: courseId,
      issueDate: new Date(),
      certificateURL,
    });
    await newCertificate.save();

    await generatePDF({ name, courseId: courseId, outputPath: certificatePath });

    await sendCertificateEmail({
      to: email,
      name,
      certificatePath,
    });

    return res.status(201).json({
      message: 'Certificate issued and sent successfully.',
      url: certificateURL,
    });

  } catch (error) {
    console.error('Certificate issuing error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
module.exports = { issueCertificate };