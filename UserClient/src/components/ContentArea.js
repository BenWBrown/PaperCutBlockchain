import React, { Component } from 'react';
import styled from 'styled-components';
import Papercut from '../Papercut.json';
import EthCrypto from 'eth-crypto';
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
const subtleCrypto = crypto.webkitSubtle || crypto.subtle;


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




class ContentArea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userAddress: '0x0', // actual user address (set with button)
      privKey: '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
      pubKey: '0x0',
      //TODO: have some sort of login?
      userBalance: 0,
      file: "",
      // filehash: "0x123456",
      pages: 3,
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
      if (error) console.log(error);
      console.log(result);
    });

  }


  initiatePrint() {
    //first, hash the file we're sending
    const fileData = this.state.file;
    sha256(fileData).then(filehash => {
      //send a print request to the smart contract
      this.contract.methods.userPrintRequest(filehash).send({from: this.state.userAddress, gas: '359380'}).then(result => {
        console.log('result from user print request', result);
        //send the file to the printer
        const request = new Request(serverLocation + 'print', {
          method: 'POST',
          body: JSON.stringify({
            user: this.state.userAddress,
            file: fileData
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

  setPrivKey() {
    const pubKey = EthCrypto.publicKeyByPrivateKey(this.state.privKey);
    const userAddress = EthCrypto.addressByPublicKey(pubKey);
    this.setState({pubKey, userAddress, userBalance: 'Loading...'});
    this.contract.methods.getBalance(userAddress)
      .call({from: userAddress, gas: '359380'})
      .then(result => {
        const balance = parseInt(result);
        this.setState({userBalance: balance});
      }).catch(error => {
        console.log(error);
      });
  }

  setAddress() {

  }

  onAddressChange(e) {
    this.setState({addresstext: e.target.value});
  }

  onPrivKeyChange(e) {
    this.setState({privKey: e.target.value});
  }

  onFileNameChange(e) {
    this.setState({file: e.target.value});
  }


  render() {
    const balance = this.state.userBalance.toFixed ? (this.state.userBalance / 1e18).toFixed(2) : this.state.userBalance;
    return(
      <div>
        <p>Content Area</p>
        <input type='text' onChange={(e) => this.onPrivKeyChange(e)} value={this.state.privKey}></input>
        <button onClick={() => this.setPrivKey()}>Set Private Key</button>
        <br/>
        <p>{'Address: ' + this.state.userAddress}</p>
        <p>{'Balance: ' +  balance}</p>
        <input type='text' onChange={(e) => this.onFileNameChange(e)} value={this.state.file}></input> //TODO: SET FILE, FILEHASH, AND PAGES STATE
        <br/>
        <button onClick={() => this.initiatePrint()}>Initiate Print</button>
      </div>
    )
  }

}

export default ContentArea;
