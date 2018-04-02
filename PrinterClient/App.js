const Papercut = artifacts.require("./Papercut.sol");
module.exports = function(callback) {


const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());


app.get('/', (req, res) => res.send('Hello World!'))

app.post('/print', (req, res) => {
  res.send('You are printing yaya')
});

app.listen(5555, () => {
  let pc;
  Papercut.deployed().then(instance => {

    // set up event listener
    pc = instance;
    pc.Transfer().watch( (err, resp) => {
      if (err) {
        console.log('err:', err);
      } else {
        console.log(resp.args._value.toNumber());
      }
    })
  });
})



} // module.exports
