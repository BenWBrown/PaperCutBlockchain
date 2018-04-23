import React from 'react';
import {BigNumber} from 'bignumber.js';
import { Button } from 'react-bootstrap';

function Offer(props) {
  const pcMoney = BigNumber(props.offer.pcAmount).dividedBy(1e18).toString();
  const ethAmount = BigNumber(props.offer.ethAmount).dividedBy(1e18).toString();
  return (
    <div>
      <p>Papercut Money: {pcMoney}</p>
      <p>Price: {ethAmount} ETH</p>
      <Button onClick={() => props.onBuy(props.offer.offerNumber)}>Buy</Button>
    </div>
  )
}

export default Offer;
