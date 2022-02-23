import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
  CampaignFactory.abi,
  "0x4229d4CC86D8b250EeF49EC8c01Bfb6bAaE2A008"
);

export default instance;
