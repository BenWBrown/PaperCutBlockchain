const Papercut = artifacts.require("./Papercut.sol");
module.exports = function(callback) {


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json());

const unapprovedFiles = {}; // maps hashes to file data. TODO: use a database on disk
const approvedFiles = {};

let sha256 = function sha256(data) {
  return '1193046'; //TODO: USE A CRYPTO LIBRARY LOL
}


app.get('/', (req, res) => res.send('Hello World!'))

app.post('/print', (req, res) => {
  // res.send('You are printing yaya');
  const hash = sha256(req.body.file);
  unapprovedFiles[hash] = req.body.file;
});

app.listen(5555, () => {
  let pc;
  Papercut.deployed().then(instance => {

    // set up event listener
    pc = instance;
    pc.Print().watch( (err, response) => {
      if (err) {
        console.log('err:', err);
      } else {
          console.log(response.args.pages.toString());
          console.log(response.args._filehash.toString());
      }
    })
  });
})



} // module.exports
