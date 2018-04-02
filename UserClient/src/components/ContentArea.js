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
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
}

console.log(web3);


const serverLocation = 'http://localhost:5555/';






class ContentArea extends Component {
  constructor(props) {
    super(props);
    // const drizzleStore = generateStore(this.props.options);
    // console.log(drizzleStore);
    // this.drizzle = new Drizzle(this.props.options, drizzleStore);
    // console.log(this.drizzle);


  }

  componentDidMount() {
    fetch(serverLocation)
      .then(response => response.text())
      .then(text => console.log(text));

    // fetch('/articles/')
    //   .then(response => response.json()).then((data) => {
    //     this.setState({ collection: data });
    //   }).catch((error) => {
    //     console.log('Error in fetching data', error); // eslint-disable-line no-console
    //   });
  }

  initiatePrint() {
    const request = new Request(serverLocation + 'print', {
      method: 'POST',
      body: JSON.stringify({
        username: 'test user',
        file: 'BINARY FILE DATA'
      }),
      headers: new Headers({ 'Content-type': 'application/json' }),
    });

    fetch(request)
      .then(response => {
        return response.text();
      }).then(text => {
        console.log(text);
      }).catch(error => {
        console.log(error);
      })

      const acc1 = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
      const acc2 = "0xf17f52151EbEF6C7334FAD080c5704D77216b732";
      const contractAddress = "0x345ca3e014aaf5dca488057592ee47305d9b3e10"

      //send ether from acc1 to acc2
      // const transaction1 = {
      //   from: acc1,
      //   to: acc2,
      //   value: "10000000000000000000" //10 eth (todo: make this prettier)
      //   // value: "1000000000000000000"
      // }
      // web3.eth.sendTransaction(transaction1, (error, result) => {
      //   console.log('transaction1');
      //   console.log('error: ', error);
      //   console.log('result: ', result);
      // })

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
    return(
      <div>
        <p>Content Area</p>
        <button onClick={() => this.initiatePrint()}>Initiate Print</button>
      </div>
    )
  }

}

export default ContentArea;
