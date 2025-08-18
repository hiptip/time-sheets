// const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');
// const fs = require('fs');
// const os = require('os');
// const { uploadFileToS3 } = require('../uploadFileToS3');

// const credentials =  PDFServicesSdk.Credentials
//     .servicePrincipalCredentialsBuilder()
//     .withClientId("8bd5cf626985421d940c5a80eaa99953")
//     .withClientSecret("p8e-LvIHhP8EbSRS_ExhW2yySHzuQ960jNa9")
//     .build();

// // Create an ExecutionContext using credentials
// const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);


// const generatePDF = (uniqueFileName, template) => {
//     const OUTPUT = '/tmp/generatedReceipt.pdf';

//     // If our output already exists, remove it so we can run the application again.
//     if(fs.existsSync(OUTPUT)) fs.unlinkSync(OUTPUT);

//     const INPUT = `./pdf/${template}`;

//     const JSON_INPUT = require(uniqueFileName);

//     console.log('JSON_INPUT', JSON_INPUT);

//     const documentMerge = PDFServicesSdk.DocumentMerge,
//             documentMergeOptions = documentMerge.options,
//             options = new documentMergeOptions.DocumentMergeOptions(JSON_INPUT, documentMergeOptions.OutputFormat.PDF);

//     // Create a new operation instance using the options instance.
//     const documentMergeOperation = documentMerge.Operation.createNew(options);

//     // Set operation input document template from a source file.
//     const input = PDFServicesSdk.FileRef.createFromLocalFile(INPUT);
//     documentMergeOperation.setInput(input);

//     // check if content is empty and raise error if it is

//     return documentMergeOperation.execute(executionContext)
//     .then(result => result.saveAsFile(OUTPUT))
//     .then(() => {
//         const uniqueFileName = `time-sheet-${Date.now()}.pdf`
//         console.log('PDF generated');
//         // await Send the PDF
//         // uploadFileToS3(OUTPUT, uniqueFileName, 'site-time-sheets')
//         // console.log('PDF uploaded to S3');
//         // console.log('uniqueFileName', uniqueFileName);
//         // save the file locally to the /tmp directory
//         fs.copyFileSync(OUTPUT, `./${uniqueFileName}`);
//     })
//     .catch(err => {
//         if(err instanceof PDFServicesSdk.Error.ServiceApiError
//             || err instanceof PDFServicesSdk.Error.ServiceUsageError) {
//             console.log('Exception encountered while executing operation', err);
//         } else {
//             console.log('Exception encountered while executing operation', err);
//         }
//     });
// }

// // run the PDF generation
// generatePDF('./TEST_JSON.json', './receiptTemplate.docx');



const {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  DocumentMergeParams,
  OutputFormat,
  DocumentMergeJob,
  DocumentMergeResult,
  SDKError,
  ServiceUsageError,
  ServiceApiError
} = require("@adobe/pdfservices-node-sdk");
const fs = require("fs");

(async () => {
  let readStream;
  try {
      // Initial setup, create credentials instance
      const credentials = new ServicePrincipalCredentials({
        clientId: "8bd5cf626985421d940c5a80eaa99953",
        clientSecret: "p8e-LvIHhP8EbSRS_ExhW2yySHzuQ960jNa9"
      });

      // Creates a PDF Services instance
      const pdfServices = new PDFServices({credentials});

      // Creates an asset(s) from source file(s) and upload
      readStream = fs.createReadStream("./pdf/receiptTemplate.docx");
      const inputAsset = await pdfServices.upload({
        readStream,
        mimeType: MimeType.DOCX
      });

    // Setup input data for the document merge process
      const jsonString = fs.readFileSync('./pdf/TEST_JSON.json', 'utf-8');

      // Create parameters for the job
      const params = new DocumentMergeParams({
          jsonDataForMerge: JSON.parse(jsonString),
          outputFormat: OutputFormat.PDF
      });

      // Creates a new job instance
      const job = new DocumentMergeJob({inputAsset, params});

      // Submit the job and get the job result
      const pollingURL = await pdfServices.submit({job});
      const pdfServicesResponse = await pdfServices.getJobResult({
          pollingURL,
          resultType: DocumentMergeResult
      });
      // add detailed logs of the job result
      console.log("Job Result:", pdfServicesResponse.result);

      // Get content from the resulting asset(s)
      const resultAsset = pdfServicesResponse.result.asset;
      const streamAsset = await pdfServices.getContent({asset: resultAsset});

      // Creates a write stream and copy stream asset's content to it
      const outputFilePath = createOutputFilePath();
      console.log(`Saving asset at ${outputFilePath}`);

      const writeStream = fs.createWriteStream(outputFilePath);
      streamAsset.readStream.pipe(writeStream);
  } catch (err) {
      if (err instanceof SDKError || err instanceof ServiceUsageError || err instanceof ServiceApiError) {
          console.log("Exception encountered while executing operation", err);
      } else {
          console.log("Exception encountered while executing operation", err);
      }
  } finally {
      readStream?.destroy();
  }
})();

// Generates a string containing a directory structure and file name for the output file
function createOutputFilePath() {
    const filePath = "output/MergeDocumentToPDF/";
    const date = new Date();
    const dateString = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" +
        ("0" + date.getDate()).slice(-2) + "T" + ("0" + date.getHours()).slice(-2) + "-" +
        ("0" + date.getMinutes()).slice(-2) + "-" + ("0" + date.getSeconds()).slice(-2);
    fs.mkdirSync(filePath, {recursive: true});
    return (`${filePath}merge${dateString}.pdf`);
}