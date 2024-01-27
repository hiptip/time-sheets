// upload png to s3 bucket

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require('fs');
// const path = require('path');
// const { generatePDF } = require('./pdf/generatePDF');
// const { sendPDF } = require('./sendEmail');

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'AKIA47CRZMG4UTPN6COU', //process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: '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' //process.env.AWS_SECRET_ACCESS_KEY
});

const uploadFileToS3 = (fileName, key, bucket) => {
  // Read content from the file
  const fileContent = fs.readFileSync(fileName);

  // Setting up S3 upload parameters
  const params = {
    Bucket: bucket,
    Key: key, // File name you want to save as in S3
    Body: fileContent,
    ACL: 'public-read'
  };

  // Uploading files to the bucket
  s3.upload(params, function(err, data) {
    if (err) {
      console.log('Error uploading file', err);
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  });
}

module.exports = { uploadFileToS3 };