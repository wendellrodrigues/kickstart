const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const compiledFactory = require("./build/CampaignFactory.json");

const provider = new HDWalletProvider(
  "install various degree trumpet magnet physical virtual time exclude simple riot arrest",
  "https://rinkeby.infura.io/v3/7d60261d95664245affe37c48dfbd3fe"
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log("Attempting to deploy from account", accounts[0]);

  const result = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({ data: compiledFactory.evm.bytecode.object })
    .send({ gas: "4712388", gasPrice: "100000000000", from: accounts[0] });
  console.log("Contract deployed to", result.options.address);
  provider.engine.stop();
};
deploy();
