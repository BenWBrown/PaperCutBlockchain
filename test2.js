const Papercut = artifacts.require("./Papercut.sol");
module.exports = function(callback) {
  const account_one = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57"; // an address
  const account_two = "0xf17f52151EbEF6C7334FAD080c5704D77216b732"; // another address

  var meta;
  Papercut.deployed().then(function(instance) {
    meta = instance;
    return meta.getBalance.call(account_one, {from: account_one});
  }).then(function(balance) {
    // If this callback is called, the call was successfully executed.
    // Note that this returns immediately without any waiting.
    // Let's print the return value.
    console.log('acc1 balance:', balance.toNumber());
  }).then(() => {
    console.log('making acc2 request');
    return meta.getBalance.call(account_two, {from: account_two});
  }).then(balance => {
    console.log('acc2 balance:', balance.toNumber());
  }).catch(function(e) {
    // There was an error! Handle it.
  })
}
