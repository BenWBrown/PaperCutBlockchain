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

let generateOneTimeCode = function generateOneTimeCode(args) {
  const codeArray = secureRandom(1); //TODO: MAKE THIS LARGER
  const oneTimeCode = codeArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
  return oneTimeCode;
};

let encryptOneTimeCode = function encryptOneTimeCode(oneTimeCode, args) {
  const userAddress = args.user;
  const pubKey = pubkeys[userAddress];
  //TODO: VERIFY THESE MATCH? pubkey and address
  const encryptedPackage = EthCrypto.encryptWithPublicKey(pubKey, oneTimeCode);
  console.log(encryptedPackage);
  return encryptedPackage;
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
    console.log('****stored filehash', filehash);
    console.log('file recieved', user, req.body.file);
    const cost = calculateCost(req.body.file); //TODO: SEND A RESPONSE WITH DOCUMENT COST

    pc.printerPrintRequest(user, '0x' + filehash, cost, {from: printerAddress, gas: '359380'});
  }).catch(error => {
    console.log('error in sending printerPrintRequest', error);
  })
});


//this method mimics physically entering an otc into the printer
//future development: make a UI for the printer
app.post('/otc', (req, res) => {
  if (approvedFiles[req.body.otc]) {
    const user = approvedFiles[req.body.otc].user; //TODO: OBJECT DESTRUCTURING
    const filehash = approvedFiles[req.body.otc].filehash;
    const filedata = approvedFiles[req.body.otc].filedata;
    //TODO: ask permission to print
    pc.printerAnnouceFilePrinted(user, '0x' + filehash, {from: printerAddress, gas: '359380'}).then(response => {
      const event = response.logs.find(log => log.event === 'AnnouceFilePrinted');
      if (event.args.user === user && event.args.filehash.toString(16) === filehash) {
        console.log('\n\n*******Printing File:\n\n', approvedFiles[req.body.otc].filedata, '\n\n');
        approvedFiles[req.body.otc] = undefined;
        res.send('file printed!');
      } else {
        console.log('user or filehash mismatch'); //TODO: not sure what to do here
      }
    }).catch(error => console.log('error contacting printerAnnounceFile', error));
  } else {
    console.log('no file with that otc');
    res.send('no file with that otc');
  }





});

const onApprovePrint = function onApprovePrint(response) {
  const filehash = response.args.filehash.toString(16);
  const filedata = unapprovedFiles[filehash];
  if (!filedata) {
    console.log('NO MATCHING FILE DATA FOR THIS FILEHASH');
    console.log(unapprovedFiles);
    console.log(filehash);
    //TODO: send message to smart contract??
    return;
  }

  const otc = generateOneTimeCode(response.args);
  const user = response.args.user;
  encryptOneTimeCode(otc, response.args).then(encryptedPackage => {
    const iv = '0x' + encryptedPackage.iv;
    //the first two digits of the pubkey are alway '04' which indicate something to the ethcrypto package
    const ephemPubKey1 = '0x' + encryptedPackage.ephemPublicKey.substring(2, 34);
    const ephemPubKey2 = '0x' + encryptedPackage.ephemPublicKey.substring(34, 66);
    const ephemPubKey3 = '0x' + encryptedPackage.ephemPublicKey.substring(66, 98);
    const ephemPubKey4 = '0x' + encryptedPackage.ephemPublicKey.substring(98, 130);
    const ciphertext = '0x' + encryptedPackage.ciphertext;
    const mac = '0x' + encryptedPackage.mac;
    pc.printerAnnouceCode(user, response.args.filehash, iv,
      ephemPubKey1, ephemPubKey2, ephemPubKey3, ephemPubKey4, ciphertext, mac);

    unapprovedFiles[filehash] = undefined;
    approvedFiles[otc] = {user, filehash, filedata};
  });
};

const onNoUserRequest = function onNoUserRequest(response) {
  const filehash = response.args.filehash;
  unapprovedFiles[filehash] = undefined;
}

const onFileNotApproved = function onFileNotApproved(response) {
  console.log('idk what to do here..');
}

app.listen(5555, () => {

  Papercut.deployed().then(instance => {

    // set up event listener
    pc = instance;


    pc.allEvents().watch((err, response) => {
      if (err) {
        console.log('error in event', err);
        return;
      }
      console.log('Event Recoded', response.event);
      if (!pubkeys[response.args.user]) {
        console.log('********* early exit *********');
        return;
      }
      switch (response.event) {
        case 'ApprovePrint': onApprovePrint(response); break;
        case 'NoUserRequest': onNoUserRequest(response); break;
        case 'FileNotApproved': onFileNotApproved(response); break;
        default: break;
      }
    });
  });
})



} // module.exports
