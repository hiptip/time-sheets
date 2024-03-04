var nodemailer = require('nodemailer');

const sendPDF = (subject) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'northcarolinaroadbusiness',
        pass: 'gumg olzk hpgz agxe',
      }
    });

    const mailOptions = {
      from: 'northcarolinaroadbusiness@gmail.com',
      to: ['bostonhal@gmail.com', 'justinwills02@hotmail.com', 'jonesk@k2dwconsulting.com', 'lindawilliams101254@gmail.com'],
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