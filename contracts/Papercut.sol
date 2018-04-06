pragma solidity ^0.4.18;

contract Papercut {
  mapping (address => uint256) balances;
  mapping (address => uint256) withheldMoney;
  mapping (uint256 => address) fileUsers; //TODO: MAKE THIS MAP TO AN ARRAY
  mapping (uint256 => uint256) filecosts;
  address owner;

  /* event Print(address indexed _from, uint8 pages, uint256 indexed _filehash, uint256 userBalance);
  event PrintingCode(address indexed _user, uint64 printcode); */

  event ApprovePrint(address indexed user, uint256 filehash, uint256 cost, uint256 userBalance);
  event AnnoucePrintCode(address indexed user, uint256 filehash, uint256 iv, uint256 pk1, uint256 pk2, uint256 pk3, uint256 pk4, uint256 ciphertext, uint256 mac);
  event InsufficientFunds(address indexed user, uint256 filehash, uint256 userBalance, uint256 cost);
  event  NoUserRequest(address indexed user, uint256 filehash);
  //event AcknowledgeUserPrintRequest()
  /* event DisaprrovePrint(); */  //do i need this?

  function Papercut() public {
    owner = tx.origin;

    balances[tx.origin] = 1 ether * 385; //TODO: REMOVE THIS
  }

  function addValue() public payable {
    //TODO: query oracle for eth to USD conversion
    balances[msg.sender] +=  msg.value * 385; // 1 eth = $384.68 as of writing this.
  }

  /* a user requests that a given file hash be printed
   * they must always call this function before sending the file to the printer */
  function userPrintRequest(uint256 filehash) public {
    fileUsers[filehash] = msg.sender;
  }

  function printerPrintRequest(address user, uint256 filehash, uint256 cost) public {
    if (fileUsers[filehash] != user) { //if the user has not requested this file to be printed, stop.
      NoUserRequest(user, filehash);
      return;
    }
    if (balances[user] < cost) { //if the user does not have enough money to print, clear filehash and stop.
      InsufficientFunds(user, filehash, balances[user], cost);
      //TODO: remove file from fileUsers?
      return;
    }
    filecosts[filehash] = cost;
    balances[user] -= cost; //decrement their balance
    withheldMoney[user] += cost; //but withhold that money for now, we may give it back if nothing is printed
    ApprovePrint(user, filehash, cost, balances[user]);
  }

  function printerAnnouceCode(address user, uint256 filehash, uint256 iv, uint256 pk1, uint256 pk2, uint256 pk3, uint256 pk4, uint256 ciphertext, uint256 mac) public {
    uint256 cost = filecosts[filehash];
    withheldMoney[user] -= cost;
    AnnoucePrintCode(user, filehash, iv, pk1, pk2, pk3, pk4, ciphertext, mac);
  }

  function getBalance(address addr) public view returns(uint) {
    return balances[addr];
  }
}
