pragma solidity ^0.4.18;

contract Papercut {
  // to wire everything together, currently copying the Metacoin contract
  mapping (address => uint) balances;

  event Transfer(address indexed _from, address indexed _to, uint256 _value);

  function Papercut() public {
    balances[tx.origin] = 10000;
  }

  function sendCoin(address receiver, uint amount) public returns(bool sufficient) {
    if (balances[msg.sender] < amount) return false;
    balances[msg.sender] -= amount;
    balances[receiver] += amount;
    Transfer(msg.sender, receiver, amount);
    return true;
  }

  // i dont want to import or link anything (yet?)
  /* function getBalanceInEth(address addr) public view returns(uint){
    return ConvertLib.convert(getBalance(addr),2);
  } */

  function getBalance(address addr) public view returns(uint) {
    return balances[addr];
  }
}
