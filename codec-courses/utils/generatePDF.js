const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Course = require('../models/Course');

const generatePDF = async ({ name, courseId, outputPath }) => {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const backgroundPath = path.join(__dirname, '..', 'public', 'certificates', 'certificate.png');
    doc.image(backgroundPath, 0, 0, {
      width: doc.page.width,
      height: doc.page.height
    });

    doc.fontSize(32)
       .fillColor('blue')
       .font('Times-Bold')
       .text(name, 0, 280, {  
         align: 'center',
         width: doc.page.width
       });

    if (courseId) {
      const course = await Course.findOne({ _id: courseId }).select('title');
      const courseName = course ? course.title : 'Unknown Course';

      doc.fontSize(20)
         .fillColor('black')
         .font('Times-Roman')
         .text(`For completing the course: "${courseName}"`, 0, 340, {  
           align: 'center',
           width: doc.page.width
         });
    }

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
};

module.exports = generatePDF;
