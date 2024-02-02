const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

var bodyParser = require('body-parser')
const app = express();

const { generatePDF } = require('./pdf/generatePDF');
const { sendPDF } = require('./sendEmail');
const fs = require('fs');
const { uploadFileToS3 } = require('./uploadFileToS3');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors());

app.use((req, res, next) => {
  console.log('Time: ', Date.now());
  next();
});

app.use('/request-type', (req, res, next) => {
  console.log('Request type: ', req.method);
  next();
});

// add app.get
app.get('/', (req, res) => {
  console.log(req.query);
  res.send('Hello World!');
});

// add app.post
app.post('/process', async (req, res) => {
  console.log(req.headers);
  console.log(req.body);


  // Save req.body.clientSignature to a file called clientSignature.png
  const base64clientSignature = req.body.clientSignature.replace(/^data:image\/png;base64,/, "");

  fs.writeFile('tmp/clientSignature.png', base64clientSignature, 'base64', (err) => {
    if (err) throw err;
    console.log('clientSignature saved to clientSignature.png');
  });

  const base64supervisorSignature = req.body.supervisorSignature.replace(/^data:image\/png;base64,/, "");
  // Save req.body.supervisorSignature to a file called supervisorSignature.png
  fs.writeFile('tmp/supervisorSignature.png', base64supervisorSignature, 'base64', (err) => {
    if (err) throw err;
    console.log('supervisorSignature saved to supervisorSignature.png');
  });

  const clientSignatureKey = `clientSignature-${Date.now()}.png`;
  const supervisorSignatureKey = `supervisorSignature-${Date.now()}.png`;

  // Upload clientSignature.png to S3 bucket
  // try {
  //   const clientSignatureUrl = uploadFileToS3('tmp/clientSignature.png', clientSignatureKey, 'site-signatures');
  //   console.log('clientSignature.png uploaded to S3 bucket');
  //   console.log('clientSignatureUrl', clientSignatureUrl);
  //   req.body.clientSignature = clientSignatureUrl;
  // } catch (err) {
  //   console.log('Error uploading clientSignature.png to S3 bucket', err);
  // }


  await uploadFileToS3('tmp/clientSignature.png', clientSignatureKey, 'site-signatures')
    .then((clientSignatureUrl) => {
      console.log('clientSignature.png uploaded to S3 bucket');
      console.log('clientSignatureUrl', clientSignatureUrl);
      const imgTag = `<img src="${clientSignatureUrl}" />`;
      req.body.clientSignature = imgTag;
    }
    )
    .catch(err => {
      console.log('Error uploading clientSignature.png to S3 bucket', err);
    }
    );

  // try {
  //   const supervisorSignatureUrl = uploadFileToS3('tmp/supervisorSignature.png', supervisorSignatureKey, 'site-signatures');
  //   console.log('supervisorSignature.png uploaded to S3 bucket');
  //   req.body.supervisorSignature = supervisorSignatureUrl;
  // } catch (err) {
  //   console.log('Error uploading supervisorSignature.png to S3 bucket', err);
  // }

  await uploadFileToS3('tmp/supervisorSignature.png', supervisorSignatureKey, 'site-signatures')
    .then((supervisorSignatureUrl) => {
      console.log('supervisorSignature.png uploaded to S3 bucket');
      const imgTag = `<img src="${supervisorSignatureUrl}" />`;
      req.body.supervisorSignature = imgTag;
    }
    )
    .catch(err => {
      console.log('Error uploading supervisorSignature.png to S3 bucket', err);
    }
    );

  console.log('req.body', req.body)


  // Save req.body to a file called receipt.json
  fs.writeFile('tmp/receipt.json', JSON.stringify(req.body), (err) => {
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

  // await Generate the PDF

  // Email the PDF
  res.send('Got a POST request');
});

const port = process.env.PORT || 3001;

const handler = serverless(app);

app.listen(port, () => console.log('Example app is listening on port 3000.'));

module.exports.handler = (event, context, callback) => {
  const response = handler(event, context, callback);
  return response;
}