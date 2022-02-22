import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
  CampaignFactory.abi,
  "0x04d051fcf0fc666b98de88178caaf5a28bd46df8"
);

export default instance;
