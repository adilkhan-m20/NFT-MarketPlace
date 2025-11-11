const { assert } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

if (!developmentChains.includes(network.name)) {
  describe.skip;
} else {
  describe("Basic NFT Unit Tests", () => {
    let basicNft, deployer;

    beforeEach(async () => {
      const accounts = await ethers.getSigners();
      deployer = accounts[0];
      await deployments.fixture(["basicnft"]);

      // Get the deployed contract address
      const basicNftDeployment = await deployments.get("BasicNft");

      // Connect to the contract at that address
      basicNft = await ethers.getContractAt(
        "BasicNft",
        basicNftDeployment.address,
        deployer
      );
    });

    describe("Constructor", () => {
      it("Initializes the NFT Correctly.", async () => {
        const name = await basicNft.name();
        const symbol = await basicNft.symbol();
        const tokenCounter = await basicNft.getTokenCounter();
        assert.equal(name, "Dragon");
        assert.equal(symbol, "DRAG");
        assert.equal(tokenCounter.toString(), "0");
      });
    });

    describe("Mint NFT", () => {
      beforeEach(async () => {
        const txResponse = await basicNft.mintNft();
        await txResponse.wait(1);
      });
      it("Allows users to mint an NFT, and updates appropriately", async () => {
        const tokenURI = await basicNft.tokenURI(0);
        const tokenCounter = await basicNft.getTokenCounter();
        assert.equal(tokenCounter.toString(), "1");
        assert.equal(tokenURI, await basicNft.TOKEN_URI());
      });
      it("Show the correct balance and owner of an NFT", async () => {
        const deployerAddress = deployer.address;
        const deployerBalance = await basicNft.balanceOf(deployerAddress);
        const owner = await basicNft.ownerOf("0");
        assert.equal(deployerBalance.toString(), "1");
        assert.equal(owner, deployerAddress);
      });
    });
  });
}
