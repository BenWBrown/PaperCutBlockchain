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
const pubkeys = {};
let pc;

const nCrypto = require('native-crypto');
const EthCrypto = require('eth-crypto');

async function sha256(message) {

  const hash = new nCrypto.Hash('SHA256');
  const buffer = await hash.update(message).digest();
  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(buffer));

  // convert bytes to hex string
  const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
  return hashHex;

}

let calculateCost = function calculateCost(data) {
  return 5;
}

let generateOneTimeCode = function(args) {
  const userAddress = args.user;
  const pubKey = pubkeys[userAddress];
  //TODO: VERIFY THESE MATCH?
  console.log('\npubkey', pubKey.toString(16));
  const oneTimeCode = 'hello, world'; //TODO: generate a real one
  const encryptedPackage = EthCrypto.encryptWithPublicKey(pubKey, oneTimeCode);
  console.log(encryptedPackage);
  return encryptedPackage
}


app.get('/', (req, res) => res.send('Hello World!'))

app.post('/print', (req, res) => {
  // res.send('You are printing yaya');
  sha256(req.body.file).then(filehash => {
    const user = req.body.user.toLowerCase();
    const pubKey = req.body.pubKey;
    pubkeys[user] = pubKey;
    //TODO: VERIFY THAT USER AND PUBKEY MATCH
    unapprovedFiles[filehash] = req.body.file;
    console.log('file recieved', user, req.body.file);
    const cost = calculateCost(req.body.file);
    console.log(filehash);

    pc.printerPrintRequest(user, '0x' + filehash, cost, {from: printerAddress, gas: '359380'});
  }).catch(error => {
    console.log('error in sending printerPrintRequest', error);
  })
});

app.listen(5555, () => {

  Papercut.deployed().then(instance => {

    // set up event listener
    pc = instance;

    //watch for ApprovePrint events
    pc.ApprovePrint().watch((err, response) => {
      console.log("approve print");
      if (!pubkeys[response.args.user]) {
        console.log('********* early exit *********');
        return;
      }
      generateOneTimeCode(response.args).then(encryptedPackage => {
        console.log('\nencrypted package', encryptedPackage);
        //TODO: SEND ENTIRE package
        pc.printerAnnouceCode(response.args.user, response.args.filehash,'0x' + encryptedPackage.ciphertext);
      });
    });
  });
})



} // module.exports
