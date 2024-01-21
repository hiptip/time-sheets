const { generatePDF } = require('./pdf/generatePDF');
const { sendPDF } = require('./sendEmail');
const fs = require('fs');


//   // Save req.body to a file called receipt.json
//   fs.writeFile('pdf/receipt.json', JSON.stringify(req.body), (err) => {
//     if (err) throw err;
//     console.log('Receipt saved to receipt.json');
//   });

//   // await Generate the PDF
//   generatePDF()
//     .then(() => {
//       console.log('PDF generated');
//       // await Send the PDF

//       sendPDF()
//         // .then(() => {
//         //   console.log('PDF sent');
//         // })
//         // .catch(err => {
//         //   console.log('Error sending PDF', err);
//         // });
//     })
//     .catch(err => {
//       console.log('Error generating PDF', err);
//     });

module.exports.handler = async (event, context, callback) => {
  console.log(event)
  console.log(event.body)
  console.log(context)

  // Save req.body to a file called receipt.json
  fs.writeFile('/tmp/pdf/receipt.json', JSON.stringify(event), (err) => {
    if (err) throw err;
    console.log('Receipt saved to receipt.json');
  });

  // await Generate the PDF
  generatePDF()
    .then(() => {
      console.log('PDF generated');
      // await Send the PDF

      sendPDF()
        // .then(() => {
        //   console.log('PDF sent');
        // })
        // .catch(err => {
        //   console.log('Error sending PDF', err);
        // });
    })
    .catch(err => {
      console.log('Error generating PDF', err);
    });

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello World!',
      input: event,
    }),
  };

  callback(null, response);
}