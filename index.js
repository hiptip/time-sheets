const { generatePDF } = require('./pdf/generatePDF');
const { sendPDF } = require('./sendEmail');
const { uploadFileToS3 } = require('./uploadFileToS3');
const fs = require('fs');


//   // Save event.body to a file called receipt.json
//   fs.writeFile('pdf/receipt.json', JSON.stringify(event.body), (err) => {
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

  // Save event.body.clientSignature to a file called clientSignature.png
  const base64clientSignature = event.body.clientSignature.replace(/^data:image\/png;base64,/, "");

  fs.writeFile('tmp/clientSignature.png', base64clientSignature, 'base64', (err) => {
    if (err) throw err;
    console.log('clientSignature saved to clientSignature.png');
  });

  const base64supervisorSignature = event.body.supervisorSignature.replace(/^data:image\/png;base64,/, "");

  // Save event.body.supervisorSignature to a file called supervisorSignature.png
  fs.writeFile('tmp/supervisorSignature.png', base64supervisorSignature, 'base64', (err) => {
    if (err) throw err;
    console.log('supervisorSignature saved to supervisorSignature.png');
  });

  const clientSignatureKey = `clientSignature-${Date.now()}.png`;
  const supervisorSignatureKey = `supervisorSignature-${Date.now()}.png`;

  await uploadFileToS3('tmp/clientSignature.png', clientSignatureKey, 'site-signatures')
    .then((clientSignatureUrl) => {
      console.log('clientSignature.png uploaded to S3 bucket');
      console.log('clientSignatureUrl', clientSignatureUrl);
      const imgTag = `<img src="${clientSignatureUrl}" />`;
      event.body.clientSignature = imgTag;
    }
    )
    .catch(err => {
      console.log('Error uploading clientSignature.png to S3 bucket', err);
    }
    );

  await uploadFileToS3('tmp/supervisorSignature.png', supervisorSignatureKey, 'site-signatures')
    .then((supervisorSignatureUrl) => {
      console.log('supervisorSignature.png uploaded to S3 bucket');
      const imgTag = `<img src="${supervisorSignatureUrl}" />`;
      event.body.supervisorSignature = imgTag;
    }
    )
    .catch(err => {
      console.log('Error uploading supervisorSignature.png to S3 bucket', err);
    }
    );

  console.log('event.body', event.body)

  // Save event.body to a file called receipt.json
  fs.writeFile('tmp/receipt.json', JSON.stringify(event.body), (err) => {
    if (err) throw err;
    console.log('Receipt saved to receipt.json');
    generatePDF(clientSignatureKey, supervisorSignatureKey)
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
  });

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello World!',
      input: event,
    }),
    headers: {
      'Access-Control-Allow-Headers' : 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    },
  };

  callback(null, response);
}