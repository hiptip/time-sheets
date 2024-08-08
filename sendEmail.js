var nodemailer = require('nodemailer');

const sendPDF = (subject) => {
    console.log('subject', subject)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'northcarolinaroadbusiness',
        pass: 'kufc sovb kybk emqx',
      }
    });

    const mailOptions = {
      from: 'northcarolinaroadbusiness@gmail.com',
      to: ['jonesk@k2dwconsulting.com', 'lwilliamstssam@gmail.com'],
      subject: subject,
      text: 'Please find attached the time sheet for the day.',
      attachments: [
        {
          filename: 'generatedReceipt.pdf',
          path: '/tmp/generatedReceipt.pdf',
          contentType: 'application/pdf'
        }
      ]
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        return { success: true };
      };
    });
}

module.exports = { sendPDF };