const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');
const fs = require('fs');

const OUTPUT = './generatedReceipt.pdf';

// If our output already exists, remove it so we can run the application again.
if(fs.existsSync(OUTPUT)) fs.unlinkSync(OUTPUT);

const INPUT = './pdf/receiptTemplate.docx';

const JSON_INPUT = require('./receipt.json');

const credentials =  PDFServicesSdk.Credentials
    .servicePrincipalCredentialsBuilder()
    .withClientId(process.env.PDF_SERVICES_CLIENT_ID)
    .withClientSecret(process.env.PDF_SERVICES_CLIENT_SECRET)
    .build();

// Create an ExecutionContext using credentials
const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);

const documentMerge = PDFServicesSdk.DocumentMerge,
       documentMergeOptions = documentMerge.options,
       options = new documentMergeOptions.DocumentMergeOptions(JSON_INPUT, documentMergeOptions.OutputFormat.PDF);

// Create a new operation instance using the options instance.
const documentMergeOperation = documentMerge.Operation.createNew(options);

// Set operation input document template from a source file.
const input = PDFServicesSdk.FileRef.createFromLocalFile(INPUT);
documentMergeOperation.setInput(input);


// Execute the operation and Save the result to the specified location.
// wrap this in a function and export it

const generatePDF = () => {
    return documentMergeOperation.execute(executionContext)
    .then(result => result.saveAsFile(OUTPUT))
    .catch(err => {
        if(err instanceof PDFServicesSdk.Error.ServiceApiError
            || err instanceof PDFServicesSdk.Error.ServiceUsageError) {
            console.log('Exception encountered while executing operation', err);
        } else {
            console.log('Exception encountered while executing operation', err);
        }
    });
}

module.exports = { generatePDF };
// documentMergeOperation.execute(executionContext)
// .then(result => result.saveAsFile(OUTPUT))
// .catch(err => {
//     if(err instanceof PDFServicesSdk.Error.ServiceApiError
//         || err instanceof PDFServicesSdk.Error.ServiceUsageError) {
//         console.log('Exception encountered while executing operation', err);
//     } else {
//         console.log('Exception encountered while executing operation', err);
//     }
// });