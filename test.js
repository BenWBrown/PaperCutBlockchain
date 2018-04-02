const Papercut = artifacts.require("./Papercut.sol");
module.exports = function(callback) {
  const account_one = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57"; // an address
  const account_two = "0xf17f52151EbEF6C7334FAD080c5704D77216b732"; // another address

  let meta;
  Papercut.deployed().then( instance => {
    meta = instance;
    return meta.sendCoin(account_two, 10, {from: account_one});
  }).then(function(result) {
    // If this callback is called, the transaction was successfully processed.
    //alert("Transaction successful!");
    console.log("successfully transfered funds");
  }).catch(function(e) {
    // There was an error! Handle it.
    //alert("Error!");
    console.log(e);
  })
}
