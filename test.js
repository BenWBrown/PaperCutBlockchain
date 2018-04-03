const Papercut = artifacts.require("./Papercut.sol");

module.exports = function(callback) {
  const account_one = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57"; // an address
  const account_two = "0xf17f52151EbEF6C7334FAD080c5704D77216b732"; // another address

  let pc;
  Papercut.deployed().then( instance => {
    pc = instance;
    return pc.addValue({from: account_one, value:1e18}); //acc one should have 1 eth worth of money
  }).then(function(result) {
    return pc.addValue({from: account_two, value:Math.floor(1e18 / 385)}); //acc two should have 1 USD worth of money
    // If this callback is called, the transaction was successfully processed.
    //alert("Transaction successful!");

  }).then( result => {
    console.log("successfully transfered funds");
  })
  .catch(function(e) {
    // There was an error! Handle it.
    //alert("Error!");
    console.log(e);
  })
}
