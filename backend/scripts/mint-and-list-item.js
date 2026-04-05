const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const PRICE = ethers.parseEther("0.1");

async function mintAndList() {
  // Get deployed marketplace
  const nftMarketplace = await ethers.getContract("NFTMarketPlace");

  // Randomly choose NFT contract
  const randomNumber = Math.floor(Math.random() * 2);
  let basicNft;

  if (randomNumber === 1) {
    basicNft = await ethers.getContract("BasicNftTwo");
  } else {
    basicNft = await ethers.getContract("BasicNft");
  }

  console.log("Minting NFT...");
  const mintTx = await basicNft.mintNft();
  const mintTxReceipt = await mintTx.wait(1);

  // Extract tokenId safely (ethers v6)
  let tokenId;
  for (const log of mintTxReceipt.logs) {
    if (log.fragment && log.fragment.name === "Transfer") {
      tokenId = log.args.tokenId;
      break;
    }
  }

  if (tokenId === undefined) {
    throw new Error("TokenId not found in transaction logs");
  }

  console.log(`Minted NFT with tokenId: ${tokenId}`);

  console.log("Approving NFT...");
  const approvalTx = await basicNft.approve(
    nftMarketplace.target, // ethers v6 uses .target instead of .address
    tokenId,
  );
  await approvalTx.wait(1);

  console.log("Listing NFT...");
  const tx = await nftMarketplace.listItem(
    basicNft.target, // ethers v6 fix
    tokenId,
    PRICE,
  );
  await tx.wait(1);

  console.log("NFT Listed!");

  // Local network block move
  if (network.config.chainId == 31337) {
    await moveBlocks(1, 1000);
  }
}

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
