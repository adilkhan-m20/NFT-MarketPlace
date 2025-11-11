const { network } = require("hardhat");
const {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;
  console.log("Starting NFTMarketplace deployment...");
  console.log("Network:", network.name);
  console.log("Deployer:", deployer);
  log("----------------------------------------------------");
  const args = [];
  const nftMarketPlace = await deploy("NFTMarketPlace", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  console.log("NFTMarketplace deployed to:", nftMarketPlace.address);
  console.log("Transaction hash:", nftMarketPlace.transactionHash);
  console.log("Block number:", nftMarketPlace.receipt.blockNumber);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(nftMarketPlace.address, args);
  }
  log("------------------------------------------------------");
};

module.exports.tags = ["all", "nftmarketplace"];
