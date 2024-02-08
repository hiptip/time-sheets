var nodemailer = require('nodemailer');

const sendPDF = () => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'northcarolinaroadbusiness',
        pass: 'gumg olzk hpgz agxe',
      }
    });

    const mailOptions = {
      from: 'northcarolinaroadbusiness@gmail.com',
      to: ['bicknoston@gmail.com', 'bostonhal@gmail.com'],
      subject: 'Time Sheet',
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