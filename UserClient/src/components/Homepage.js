import React, { Component } from 'react';
// import styled from 'styled-components';  //todo: make this look slighty nicer?
import Papercut from '../Papercut.json';
import EthCrypto from 'eth-crypto';
import {BigNumber} from 'bignumber.js';
// import { Drizzle, generateStore } from 'drizzle';
import Web3 from 'web3';
let web3;
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8546"));
}

const crypto = window.crypto || window.msCrypto; // for IE 11
const subtleCrypto = crypto.subtle;


const serverLocation = 'http://localhost:5555/';
const contractAddress = "0x345ca3e014aaf5dca488057592ee47305d9b3e10"; //TODO: GET THIS OFF THE BLOCKCHAIN SOMEHOW?


async function sha256(message) {

    // encode as UTF-8
    const msgBuffer = new TextEncoder('utf-8').encode(message);

    // hash the message
    const hashBuffer = await subtleCrypto.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return hashHex;
}




class Homepage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //TODO: have some sort of login?
      userBalance: this.props.startingBalance,
      file: '',
      pages: 3,
      otc: '',
    }
    this.contract = new web3.eth.Contract(Papercut.abi, contractAddress);
  }

  componentDidMount() {
    fetch(serverLocation)
      .then(response => response.text())
      .then(text => console.log(text));

    this.contract.events.ApprovePrint({}, (error, result) => {
      console.log('PRINT APPROVED. UPDATE UI');
      if (error) console.log(error);
      console.log(result);
    });

    this.contract.events.AnnoucePrintCode({}, (error, result) => {
      console.log('PRINT CODE ANNOUNCED');
      if (error) console.log('error', error);
      // const user = new BigNumber(result.returnValues.user).toString(16);
      // const filehash = new BigNumber(result.returnValues.filehash).toString(16);
      const iv = new BigNumber(result.returnValues.iv).toString(16).padStart(32, '0');
      const ciphertext = new BigNumber(result.returnValues.ciphertext).toString(16).padStart(32, '0');
      const pk = [result.returnValues.pk1, result.returnValues.pk2, result.returnValues.pk3, result.returnValues.pk4]
        .map(pk => new BigNumber(pk).toString(16).padStart(32, '0'));
      const ephemPublicKey = pk.reduce(((acc, val) => acc + val), '04');
      const mac = new BigNumber(result.returnValues.mac).toString(16).padStart(64, '0');
      const encryptedPackage = {iv, ephemPublicKey, ciphertext, mac};
      EthCrypto.decryptWithPrivateKey(this.props.privKey, encryptedPackage).then(printCode => {
        console.log('printcode', printCode);
      }).catch(e => {
        console.log('error',e);
      })
    });

    this.contract.events.NoUserRequest({}, (error, result) => {
      console.log('NO USER REQUEST');
      if (error) console.log('error', error);
      console.log(result);
    });

    this.contract.events.InsufficientFunds({}, (error, result) => {
      console.log('INSUFFICIENT FUNDS');
      if (error) console.log('error', error);
      console.log(result);
    });

  }


  initiatePrint() {
    //first, hash the file we're sending
    const fileData = this.state.file;
    sha256(fileData).then(filehash => {
      //send a print request to the smart contract
      console.log('pub key', this.props.pubKey);
      this.contract.methods.userPrintRequest(filehash).send({from: this.props.userAddress, gas: '359380'}).then(result => {
        console.log('result from user print request', result);
        //send the file to the printer
        const request = new Request(serverLocation + 'print', {
          method: 'POST',
          body: JSON.stringify({
            user: this.props.userAddress,
            file: fileData,
            pubKey: this.props.pubKey,
          }),
          headers: new Headers({ 'Content-type': 'application/json' }),
        });

        fetch(request).then(response => {
          return response.text();
        }).then(text => {
          console.log('server resonse to file', text);
        }).catch(error => {
          console.log('error sending file to server', error);
        });
      }).catch(error => {
        console.log('error', error);
      });
    }).catch(error => {
      console.log('error hashing data, this should never happen', error);
    });

  }

  //this function (and associated button) mimic physically entering the OTC in the printer
  sendOTC() {
    const request = new Request(serverLocation + 'otc', {
      method: 'POST',
      body: JSON.stringify({
        otc: this.state.otc,
      }),
      headers: new Headers({ 'Content-type': 'application/json' }),
    });

    fetch(request).then(response => {
      console.log('response from sending otc', response);
    }).catch(error => {
      console.log('error sending otc', error);
    })
  }

  onAddressChange(e) {
    this.setState({addresstext: e.target.value});
  }


  onFileNameChange(e) {
    this.setState({file: e.target.value});
  }

  onOTCChange(e) {
    this.setState({otc: e.target.value});
  }


  render() {
    const balance = this.state.userBalance.toFixed ? (this.state.userBalance / 1e18).toFixed(2) : this.state.userBalance;
    return(
      <div>
        <p>{'Address: ' + this.props.userAddress}</p>
        <p>{'Balance: ' +  balance}</p>
        <input type='text' onChange={(e) => this.onFileNameChange(e)} value={this.state.file} placeholder='File text'></input>
        <button onClick={() => this.initiatePrint()}>Initiate Print</button>
        <br/><br/>
        <p>*** The below button mimics physically entering the OTC into the printer.</p>
        <input type='text' onChange={(e) => this.onOTCChange(e)} value={this.state.otc} placeholder='One-Time Print Code'></input>
        <button onClick={() => this.sendOTC()}>Print!</button>
        <br/>
        <button onClick={this.props.logout}>Logout</button>
      </div>
    )
  }

}

export default Homepage;