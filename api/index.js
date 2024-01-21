const express = require('express');
const cors = require('cors');

var bodyParser = require('body-parser')
const app = express();

const { generatePDF } = require('./pdf/generatePDF');
const { sendPDF } = require('./sendEmail');
const fs = require('fs');

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
app.post('/', (req, res) => {
  console.log(req.headers);
  console.log(req.body);

  // Save req.body to a file called receipt.json
  fs.writeFile('pdf/receipt.json', JSON.stringify(req.body), (err) => {
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

  // Email the PDF
  res.send('Got a POST request');
});

app.listen(3001, () => console.log('Example app is listening on port 3001.'));