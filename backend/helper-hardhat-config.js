const networkConfig = {
  default: {
    name: "hardhat",
  },
  31337: {
    name: "localhost",
    subscriptionId: "588",
    gasLane: "",
    keepersUpdateInterval: "30",
    callbackGasLimit: "500000",
  },
  11155111: {
    name: "sepolia",
    subscriptionId: "588",
    keepersUpdateInterval: "30",
    callbackGasLimit: "500000",
  },
  1: {
    name: "mainnet",
    keepersUpdateInterval: "30",
  },
};

const developmentChains = ["hardhat", "localhost"];
const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
const FrontEndFilePath1 = "";
const FrontEndFilePath2 = "";
const FrontEndAbi1Location = "";
const FrontEndAbi2Location = "";

module.exports = {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  FrontEndFilePath1,
  FrontEndFilePath2,
  FrontEndAbi1Location,
  FrontEndAbi2Location,
};
