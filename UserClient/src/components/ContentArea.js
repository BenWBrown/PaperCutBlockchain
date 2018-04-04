import React, { Component } from 'react';
import styled from 'styled-components';
import Papercut from '../Papercut.json'
// import { Drizzle, generateStore } from 'drizzle';
import Web3 from 'web3';
let web3;
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8546"));
}


const serverLocation = 'http://localhost:5555/';
const contractAddress = "0x345ca3e014aaf5dca488057592ee47305d9b3e10"; //TODO: GET THIS OFF THE BLOCKCHAIN SOMEHOW?


let sha256 = function sha256(data) {
  return '1193046'; //TODO: USE A CRYPTO LIBRARY LOL
}




class ContentArea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addresstext: '0x0', // text in input element
      userAddress: '0x0', // actual user address (set with button)
      //TODO: have some sort of login?
      userBalance: 0,
      file: "",
      filehash: "0x123456",
      pages: 3,
    }
    this.contract = new web3.eth.Contract(Papercut.abi, contractAddress);


  }

  componentDidMount() {
    fetch(serverLocation)
      .then(response => response.text())
      .then(text => console.log(text));

    this.contract.events.ApprovePrint({}, (error, result) => {
      console.log(error);
      console.log(result);
    });

    // this.contract.events.ApprovePrint().watch( (error, result) => {
    //   console.log(error);
    //   console.log(result);
    // });

    // fetch('/articles/')
    //   .then(response => response.json()).then((data) => {
    //     this.setState({ collection: data });
    //   }).catch((error) => {
    //     console.log('Error in fetching data', error); // eslint-disable-line no-console
    //   });
  }


  initiatePrint() {
    const fileData = 'BINARY FILE DATA'; //TODO: actually get file data lol
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
      console.log(text);
      if (false) {
        throw 'error in sending file to server';
      }
    }).then(() => {
      const filehash = sha256(fileData);
      return this.contract.methods.userPrintRequest(filehash)
        .send({from: this.state.userAddress, gas: '359380'});
    }).then(result => {
      console.log('result', result);
    })
    .catch(error => {
      console.log(error);
    })

  }

  setAddress() {
    this.setState({
      userAddress: this.state.addresstext,
      userBalance: "Loading...",
    });
    this.contract.methods.getBalance(this.state.addresstext)
      .call({from: this.state.addresstext, gas: '359380'})
      .then(result => {
        const balance = parseInt(result);
        this.setState({userBalance: balance});
      }).catch(error => {
        console.log(error);
      });
  }

  onAddressChange(e) {
    this.setState({addresstext: e.target.value});
  }

  sendMoney() {
      const acc1 = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
      const acc2 = "0xf17f52151EbEF6C7334FAD080c5704D77216b732";
      const contractAddress = "0x345ca3e014aaf5dca488057592ee47305d9b3e10";


      //now, send MetaCoins from one acc to anothers
      const contract = new web3.eth.Contract(Papercut.abi, contractAddress);

      contract.methods.sendCoin(acc2, 10).send({from: acc1, gas: '35938'}).then(result => {
        // console.log('transaction 2');
        // console.log('result: ', result);
      }).catch(e => {
        console.log(e);
      })
  }

  render() {
    const balance = this.state.userBalance.toFixed ? (this.state.userBalance / 1e18).toFixed(2) : this.state.userBalance;
    return(
      <div>
        <p>Content Area</p>
        <input type='text' onChange={(e) => this.onAddressChange(e)} value={this.state.addresstext}></input>
        <button onClick={() => this.setAddress()}>Set Address</button>
        <br/>
        <p>{'Address: ' + this.state.userAddress}</p>
        <p>{'Balance: ' +  balance}</p>
        <input type='file'></input> //TODO: SET FILE, FILEHASH, AND PAGES STATE
        <br/>
        <button onClick={() => this.initiatePrint()}>Initiate Print</button>
      </div>
    )
  }

}

export default ContentArea;
