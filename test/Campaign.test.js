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

  it("allows a manager to make a payment request", async () => {
    await campaign.methods
      .createRequest("Buy batteries", "100", accounts[1])
      .send({
        from: accounts[0],
        gas: "1000000",
      });
    const request = await campaign.methods.requests(0).call();
    assert.equal("Buy batteries", request.description);
  });

  it("processes request", async () => {
    //Get initial balance of accounts[1]
    let initialBalance = await web3.eth.getBalance(accounts[1]);
    initialBalance = web3.utils.fromWei(initialBalance, "ether");
    initialBalance = parseFloat(initialBalance);
    //Contribute to account
    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei("10", "ether"),
    });
    //Create request
    await campaign.methods
      .createRequest(
        "Buy batteries",
        web3.utils.toWei("5", "ether"),
        accounts[1]
      )
      .send({
        from: accounts[0],
        gas: "1000000",
      });
    //Vote
    await campaign.methods.approveRequest(0).send({
      from: accounts[0],
      gas: "1000000",
    });
    //Finalize request
    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: "1000000",
    });

    //Final balance of account[1]
    let finalBalance = await web3.eth.getBalance(accounts[1]);
    finalBalance = web3.utils.fromWei(finalBalance, "ether");
    finalBalance = parseFloat(finalBalance);

    //Difference should be around 5 ether (5 ether sent from account[0] -> account[1])
    const difference = finalBalance - initialBalance;
    assert(difference > 4);
  });

  it("blocks non-manager from making payment request", async () => {
    try {
      await campaign.methods
        .createRequest("Buy batteries", "100", accounts[2])
        .send({
          from: accounts[1],
          gas: "1000000",
        });
      const request = await campaign.methods.requests(0).call();
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("gets campaign statistics", async () => {
    const summary = await campaign.methods.getSummary().call();
    const manager = await campaign.methods.manager().call();
    assert(summary[0] == "100");
    assert(summary[1] == "0");
    assert(summary[4] == manager);
  });

  it("displays requests count", async () => {
    const requestsCount = await campaign.methods.getRequestsCount().call();
    assert(requestsCount == "0");
  });
});
