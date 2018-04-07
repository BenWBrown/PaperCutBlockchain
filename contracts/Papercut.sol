pragma solidity ^0.4.18;

contract Papercut {
  mapping (address => uint256) balances;
  mapping (address => uint256) withheldMoney;
  mapping (uint256 => address) fileUsers; //maps filehashes to users
  mapping (address => mapping(uint256 => bool)) userUnapprovedFiles; //maps users to a set of file hashes
  mapping (address => mapping(uint256 => bool)) userApprovedFiles; //maps users to a set of file hashes
  mapping (uint256 => uint256) filecosts;
  address owner;


  event ApprovePrint(address indexed user, uint256 filehash, uint256 cost, uint256 userBalance);
  event AnnoucePrintCode(address indexed user, uint256 filehash, uint256 iv, uint256 pk1, uint256 pk2, uint256 pk3, uint256 pk4, uint256 ciphertext, uint256 mac);
  event InsufficientFunds(address indexed user, uint256 filehash, uint256 userBalance, uint256 cost);
  event NoUserRequest(address indexed user, uint256 filehash);
  event FileNotApproved(address indexed user, uint256 filehash);
  event AnnouceFilePrinted(address indexed user, uint256 filehash);

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
    /* fileUsers[filehash] = msg.sender; */
    userUnapprovedFiles[msg.sender][filehash] = true;
  }

  function printerPrintRequest(address user, uint256 filehash, uint256 cost) public {
    if (!userUnapprovedFiles[user][filehash]) { //if the user has not requested this file to be printed, stop.
      NoUserRequest(user, filehash);
      return;
    }
    if (balances[user] < cost) { //if the user does not have enough money to print, clear filehash and stop.
      userUnapprovedFiles[user][filehash] = false;
      InsufficientFunds(user, filehash, balances[user], cost);
      return;
    }
    userUnapprovedFiles[user][filehash] = false; //switch this file to a user's approved files
    userApprovedFiles[user][filehash] = true;
    filecosts[filehash] = cost;
    balances[user] -= cost; //decrement user balance
    withheldMoney[user] += cost; //but withhold that money for now, we may give it back if the user cancels their print
    ApprovePrint(user, filehash, cost, balances[user]);
  }

  function printerAnnouceCode(address user, uint256 filehash, uint256 iv, uint256 pk1, uint256 pk2, uint256 pk3, uint256 pk4, uint256 ciphertext, uint256 mac) public {
    if (!userApprovedFiles[user][filehash]) {
      FileNotApproved(user, filehash);
      return;
    }
    AnnoucePrintCode(user, filehash, iv, pk1, pk2, pk3, pk4, ciphertext, mac);
  }

  function printerAnnouceFilePrinted(address user, uint256 filehash) public {
    if (!userApprovedFiles[user][filehash]) {
      FileNotApproved(user, filehash);
      return;
    }
    withheldMoney[user] -= filecosts[filehash];
    filecosts[filehash] = 0;
    AnnouceFilePrinted(user, filehash);
  }

  function getBalance(address addr) public view returns(uint) {
    return balances[addr];
  }
}
