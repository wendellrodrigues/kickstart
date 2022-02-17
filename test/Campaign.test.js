const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");

//Web3 instance
const web3 = new Web3(ganache.provider());

//Compiled code
const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  //Deploy factory contract
  factory = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({ data: compiledFactory.evm.bytecode.object })
    .send({ from: accounts[0], gas: "4712388", gasPrice: "100000000000" });

  //Make one campaign
  await factory.methods.createCampaign("100").send({
    from: accounts[0],
    gas: "4712388",
    gasPrice: "100000000000",
  });

  //Get first element and assign to campaignAddress (ES2016)
  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

  //Create new campaign contract
  campaign = await new web3.eth.Contract(compiledCampaign.abi, campaignAddress); //For already deployed contracts
});

describe("Campaigns", () => {
  it("deploys a factory and a campaign", () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });
  it("make sure manager is creator of contract", async () => {
    const manager = await campaign.methods.manager().call();
    assert.equal(accounts[0], manager);
  });
  it("allows people to contribute money and marks them as approvers", async () => {
    await campaign.methods.contribute().send({
      value: "200",
      from: accounts[1],
    });
    const isApprover = await campaign.methods.approvers(accounts[1]).call();
    assert(isApprover);
  });
  it("denies approver status to those who do not meet minimum donation requirements", async () => {
    try {
      await campaign.methods.contribute().send({
        value: "90",
        from: accounts[1],
      });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });
});
