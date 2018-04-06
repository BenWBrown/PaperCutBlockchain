import React, { Component } from 'react';
// import styled from 'styled-components';  //todo: make this look slighty nicer?
import Login from './Login';
import Homepage from './Homepage';

const contractAddress = "0x345ca3e014aaf5dca488057592ee47305d9b3e10"; //TODO: GET THIS OFF THE BLOCKCHAIN SOMEHOW?
const initialState = {
  loggedIn: false,
  privKey: '',
  userAddress: '',
  pubKey: '',
  balance: 0,
};

class ContentArea extends Component {

  constructor(props) {
    super(props);
    this.state = initialState;
  }

  logout() {
    this.setState(initialState);
  }


  render() {
    const login = (
      <Login
        contractAddress={contractAddress}
        onSuccessfulLogin={(privKey, userAddress, pubKey, balance) => {
          this.setState({privKey, userAddress, pubKey, balance,loggedIn: true});
        }}
      />);
    const homepage = (
      <Homepage
        privKey={this.state.privKey}
        userAddress={this.state.userAddress}
        pubKey={this.state.pubKey}
        startingBalance={this.state.balance}
        logout={() => {this.logout()}}
      />);
    return this.state.loggedIn ? homepage : login;
  }

}

export default ContentArea;
