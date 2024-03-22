const { generatePDF } = require('./pdf/generatePDF');
const { sendPDF } = require('./sendEmail');
const { uploadFileToS3 } = require('./uploadFileToS3');
const fs = require('fs');

module.exports.handler = async (event, context, callback) => {
  console.log(event)
  console.log(event.body)
  console.log(context)

  // Save event.clientSignature to a file called clientSignature.png

  if (event.clientSignature) {

    const base64clientSignature = event.clientSignature.replace(/^data:image\/png;base64,/, "");

    fs.writeFile('/tmp/clientSignature.png', base64clientSignature, 'base64', (err) => {
      if (err) throw err;
      console.log('clientSignature saved to clientSignature.png');
    });

    const clientSignatureKey = `clientSignature-${Date.now()}.png`;

    await uploadFileToS3('/tmp/clientSignature.png', clientSignatureKey, 'site-signatures')
      .then((clientSignatureUrl) => {
        console.log('clientSignature.png uploaded to S3 bucket');
        console.log('clientSignatureUrl', clientSignatureUrl);
        const imgTag = `<img src="${clientSignatureUrl}" />`;
        event.clientSignature = imgTag;
      }
      )
      .catch(err => {
        console.log('Error uploading clientSignature.png to S3 bucket', err);
      }
      );
  }

  if (event.supervisorSignature) {


    const base64supervisorSignature = event.supervisorSignature.replace(/^data:image\/png;base64,/, "");

    // Save event.supervisorSignature to a file called supervisorSignature.png
    fs.writeFile('/tmp/supervisorSignature.png', base64supervisorSignature, 'base64', (err) => {
      if (err) throw err;
      console.log('supervisorSignature saved to supervisorSignature.png');
    });

    const clientSignatureKey = `clientSignature-${Date.now()}.png`;
    const supervisorSignatureKey = `supervisorSignature-${Date.now()}.png`;

    await uploadFileToS3('/tmp/supervisorSignature.png', supervisorSignatureKey, 'site-signatures')
      .then((supervisorSignatureUrl) => {
        console.log('supervisorSignature.png uploaded to S3 bucket');
        const imgTag = `<img src="${supervisorSignatureUrl}" />`;
        event.supervisorSignature = imgTag;
      }
      )
      .catch(err => {
        console.log('Error uploading supervisorSignature.png to S3 bucket', err);
      }
      );

    }



  console.log('event.body', event.body)

  // delete /tmp/receipt.json if it exists
  if (fs.existsSync('/tmp/receipt.json')) fs.unlinkSync('/tmp/receipt.json');

  // Save event.body to a file called receipt.json
  fs.writeFile('/tmp/receipt.json', JSON.stringify(event), (err) => {
    if (err) throw err;
    console.log('Receipt saved to receipt.json');
    generatePDF()
    .then(() => {
      console.log('PDF generated');
      // await Send the PDF
      // get teamLead from event
      const teamLead = event.teamLead;
      console.log('event', event)
      console.log('teamLead', teamLead);
      sendPDF(teamLead)
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
      "Access-Control-Allow-Credentials": true,
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    },
  };

  callback(null, response);
}