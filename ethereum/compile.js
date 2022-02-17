const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");

const buildPath = path.resolve(__dirname, "build"); //Where we are going to put .json files
fs.removeSync(buildPath); //Remove everything in build directory (need fs-extra to remove entire folder)

const campaignPath = path.resolve(__dirname, "contracts", "Campaign.sol");
const source = fs.readFileSync(campaignPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "Campaign.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

//Parse compiled solidity code
const output = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
  "Campaign.sol"
];

//Make sure there is a build path. Create one if n/a
fs.ensureDirSync(buildPath);

//Write each contract in Camapaign.sol into .json files in /build folder
for (let contract in output) {
  fs.outputJsonSync(
    path.resolve(buildPath, `${contract}.json`),
    output[contract]
  );
}
