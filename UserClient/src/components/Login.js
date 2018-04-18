import React, { Component } from 'react';
// import styled from 'styled-components';  //todo: make this look slighty nicer?
import Papercut from '../Papercut.json';
import EthCrypto from 'eth-crypto';
import { Button } from 'react-bootstrap';
// import { Drizzle, generateStore } from 'drizzle';
import Web3 from 'web3';
let web3;
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8546"));
}

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      privKeyText: '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
    }
    this.contract = new web3.eth.Contract(Papercut.abi, this.props.contractAddress);
  }

  onPrivKeyChange(e) {
    this.setState({privKeyText: e.target.value});
  }

  login() {
    const pubKey = EthCrypto.publicKeyByPrivateKey(this.state.privKeyText);
    const userAddress = EthCrypto.addressByPublicKey(pubKey);
    this.contract.methods.getBalance(userAddress)  //TODO: HAVE SMART CONTRACT VERIFY ADDRESS
      .call({from: userAddress, gas: '359380'})
      .then(result => {
        const balance = parseInt(result, 10);
        this.props.onSuccessfulLogin(this.state.privKeyText, userAddress, pubKey, balance);
      }).catch(error => {
        console.log('Error logging in', error);
      });
  }

  render() {
    return (
      <div>
        <input
          type='text'
          onChange={(e) => this.onPrivKeyChange(e)}
          value={this.state.privKeyText}>
        </input>
        <Button onClick={() => this.login()}>Set Private Key</Button>
      </div>
    );
  }
}


export default Login;
