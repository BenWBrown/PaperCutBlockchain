const Papercut = artifacts.require("./Papercut.sol");
module.exports = function(callback) {


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json());

const printerAddress = "0x5aeda56215b167893e80b4fe645ba6d5bab767de";

const unapprovedFiles = {}; // maps hashes to file data. TODO: use a database on disk
const approvedFiles = {};
let pc;

let sha256 = function sha256(data) {
  return '1193046'; //TODO: USE A CRYPTO LIBRARY LOL
}

let calculateCost = function calculateCost(data) {
  return 5;
}

let generateOneTimeCode = function(args) {
  return '0x1234';
}


app.get('/', (req, res) => res.send('Hello World!'))

app.post('/print', (req, res) => {
  // res.send('You are printing yaya');
  const filehash = sha256(req.body.file);
  const user = req.body.user;
  unapprovedFiles[filehash] = req.body.file;
  console.log('file recieved', user, req.body.file);
  const cost = calculateCost(req.body.file);

  pc.printerPrintRequest(user, filehash, cost, {from: printerAddress, gas: '359380'});
});

app.listen(5555, () => {
  Papercut.deployed().then(instance => {

    // set up event listener
    pc = instance;

    //watch for ApprovePrint events
    pc.ApprovePrint().watch((err, response) => {
      console.log("approve print");
      console.log(err);
      console.log(response);
      const code = generateOneTimeCode(response.args);
      pc.printerAnnouceCode(response.args.user, response.args.filehash, code);
    });
    // pc.Print().watch( (err, response) => {
    //   if (err) {
    //     console.log('err:', err);
    //   } else {
    //       console.log(response.args.pages.toString());
    //       console.log(response.args._filehash.toString());
    //   }
    // })
  });
})



} // module.exports
