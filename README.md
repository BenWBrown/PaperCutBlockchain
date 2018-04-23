# Reimagining PaperCut on the Blockchain

## Dependency Installation Instructions

1. Install Ganache-cli

Ganache is a tool that runs a development blockchain on your local machine. They have a very nice looking UI; however, the version of the program that supports the UI does not support a websocket connection, which we require. Therefore, we must use the command line tool. See more at https://github.com/trufflesuite/ganache-cli.
```
$ npm install -g ganache-cli
```
2. Install Truffle

Truffle is an Ethereum development framework. We use it to compile, deploy, and interact with our SmartContract.
```
$ npm install -g truffle
```

## Launching the project

To launch the project, first open four terminal tabs in the root directory of the project.

1. In the first tab, launch our development blockchain with Ganache.

```
$ ./launchGanache.sh
```

The included bash script simply launches ganache-cli on port 8546 with a given mnemonic, which deterministically creates 10 accounts on the blockchain.

2. In the second tab, deploy the SmartContract
```
$ truffle migrate
```

3. In the third tab, launch the printer server (note that you only need to install dependencies once).
```
$ cd PrinterClient
$ npm install
$ npm start
```

4. In the fourth tab, launch the React front end (again, you only need to install dependencies once).
```
$ cd UserClient
$ npm install
$ npm start
```
