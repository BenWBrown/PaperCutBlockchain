const Papercut = artifacts.require("./Papercut.sol");
module.exports = function(callback) {


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json());

const printerAddress = "0x5aeda56215b167893e80b4fe645ba6d5bab767de";

const unapprovedFiles = {}; // maps hashes to file data.
const approvedFiles = {}; //maps OTCs to file data
const pubkeys = {};
let pc;

const nCrypto = require('native-crypto');
const EthCrypto = require('eth-crypto');
const secureRandom = require('secure-random');


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
  const pcCost = .05;
  return (pcCost * 1e18).toString();
}

let generateOneTimeCode = function(args) {
  const codeArray = secureRandom(8);
  const oneTimeCode = codeArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
  const userAddress = args.user;
  const pubKey = pubkeys[userAddress];
  //TODO: VERIFY THESE MATCH? pubkey and address
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
    if (user !== EthCrypto.addressByPublicKey(pubKey).toLowerCase()) {
      console.log('Address and pubkey do not match');
      res.send('Address and pubkey do not match');
      return;
    }
    pubkeys[user] = pubKey;

    unapprovedFiles[filehash] = req.body.file;
    console.log('file recieved', user, req.body.file);
    const cost = calculateCost(req.body.file);

    pc.printerPrintRequest(user, '0x' + filehash, cost, {from: printerAddress, gas: '359380'});
  }).catch(error => {
    console.log('error in sending printerPrintRequest', error);
  })
});

const onApprovePrint = function onApprovePrint(response) {
  console.log('Event Recoded', response.event);
  if (!pubkeys[response.args.user]) {
    console.log('********* early exit *********');
    return;
  }
  generateOneTimeCode(response.args).then(encryptedPackage => {
    //TODO: SEND ENTIRE package
    const iv = '0x' + encryptedPackage.iv;
    //the first two digits of the pubkey are alway '04' which indicate something to the ethcrypto package
    const ephemPubKey1 = '0x' + encryptedPackage.ephemPublicKey.substring(2, 34);
    const ephemPubKey2 = '0x' + encryptedPackage.ephemPublicKey.substring(34, 66);
    const ephemPubKey3 = '0x' + encryptedPackage.ephemPublicKey.substring(66, 98);
    const ephemPubKey4 = '0x' + encryptedPackage.ephemPublicKey.substring(98, 130);
    const ciphertext = '0x' + encryptedPackage.ciphertext;
    const mac = '0x' + encryptedPackage.mac;
    pc.printerAnnouceCode(response.args.user, response.args.filehash, iv,
      ephemPubKey1, ephemPubKey2, ephemPubKey3, ephemPubKey4, ciphertext, mac);
  });
};

app.listen(5555, () => {

  Papercut.deployed().then(instance => {

    // set up event listener
    pc = instance;


    pc.allEvents().watch((err, response) => {
      if (err) {
        console.log('error in event', err);
        return;
      }
      switch (response.event) {
        case 'ApprovePrint': onApprovePrint(response); break;
        default:
          console.log('Event recorded', response.event);
      }
    });
  });
})



} // module.exports
