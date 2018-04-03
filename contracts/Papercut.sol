pragma solidity ^0.4.18;

contract Papercut {
  // to wire everything together, currently copying the Metacoin contract
  mapping (address => uint) balances;
  address owner;

  event Print(address indexed _from, uint256 indexed _filehash, uint8 pages);
  event PrintingCode(address indexed _user, uint64 printcode);
  /* event Transfer(address indexed _from, address indexed _to, uint256 _value); */

  function Papercut() public {
    owner = tx.origin;
    /* balances[tx.origin] = 10000; */
  }

  function addValue() public payable {
    //TODO: query oracle for eth to USD conversion
    balances[msg.sender] +=  msg.value * 385; // 1 eth = $384.68 as of writing this.
  }

  function print(uint8 pages, uint256 filehash) public returns(bool sufficient) {
    //TODO: MORE COMPLEX price computation. for now, 5 cents a page
    uint price = pages * 5 * 1 ether / 385;
    if (balances[msg.sender] < price) {
      return false;
    }
    balances[msg.sender] -= price;
    Print(msg.sender, filehash, pages);
  }

  function distributeCode(address user, uint64 printcode) public {
    //TODO: think about whtether this can go straight from printer to user
    PrintingCode(user, printcode);
  }

  /* function sendCoin(address receiver, uint amount) public returns(bool sufficient) {
    if (balances[msg.sender] < amount) return false;
    balances[msg.sender] -= amount;
    balances[receiver] += amount;
    Transfer(msg.sender, receiver, amount);
    return true;
  } */

  // i dont want to import or link anything (yet?)
  /* function getBalanceInEth(address addr) public view returns(uint){
    return ConvertLib.convert(getBalance(addr),2);
  } */

  function getBalance(address addr) public view returns(uint) {
    return balances[addr];
  }
}
