const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Nft Marketplace Unit Tests", function () {
      let nftMarketplace, nftMarketplaceContract, basicNft, basicNftContract;
      let deployer, user;
      const PRICE = ethers.parseEther("0.1");
      const TOKEN_ID = 0;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(["all"]);

        // Get deployments
        const nftMarketplaceDeployment = await deployments.get(
          "NFTMarketPlace"
        );
        const basicNftDeployment = await deployments.get("BasicNft");

        // Connect to contracts
        nftMarketplaceContract = await ethers.getContractAt(
          "NFTMarketPlace",
          nftMarketplaceDeployment.address
        );
        nftMarketplace = nftMarketplaceContract.connect(deployer);

        basicNftContract = await ethers.getContractAt(
          "BasicNft",
          basicNftDeployment.address
        );
        basicNft = basicNftContract.connect(deployer);

        await basicNft.mintNft();
        await basicNft.approve(
          await nftMarketplaceContract.getAddress(),
          TOKEN_ID
        );
      });

      describe("listItem", function () {
        it("emits an event after listing an item", async function () {
          await expect(
            nftMarketplace.listItem(
              await basicNft.getAddress(),
              TOKEN_ID,
              PRICE
            )
          ).to.emit(nftMarketplace, "ItemListed");
        });
        it("exclusively items that haven't been listed", async function () {
          await nftMarketplace.listItem(
            await basicNft.getAddress(),
            TOKEN_ID,
            PRICE
          );
          await expect(
            nftMarketplace.listItem(
              await basicNft.getAddress(),
              TOKEN_ID,
              PRICE
            )
          ).to.be.revertedWithCustomError(nftMarketplace, "AlreadyListed");
        });
        it("exclusively allows owners to list", async function () {
          nftMarketplace = await nftMarketplaceContract.connect(user);
          await expect(
            nftMarketplace.listItem(
              await basicNft.getAddress(),
              TOKEN_ID,
              PRICE
            )
          ).to.be.revertedWithCustomError(nftMarketplace, "NotOwner");
        });
        it("needs approvals to list item", async function () {
          await basicNft.approve(ethers.ZeroAddress, TOKEN_ID);
          await expect(
            nftMarketplace.listItem(
              await basicNft.getAddress(),
              TOKEN_ID,
              PRICE
            )
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "NotApprovedForMarketPlace"
          );
        });
        it("Updates listing with seller and price", async function () {
          await nftMarketplace.listItem(
            await basicNft.getAddress(),
            TOKEN_ID,
            PRICE
          );
          const listing = await nftMarketplace.getListing(
            await basicNft.getAddress(),
            TOKEN_ID
          );
          assert(listing.price.toString() == PRICE.toString());
          assert(listing.seller.toString() == deployer.address);
        });
        it("reverts if the price is 0", async () => {
          const ZERO_PRICE = ethers.parseEther("0");
          await expect(
            nftMarketplace.listItem(
              await basicNft.getAddress(),
              TOKEN_ID,
              ZERO_PRICE
            )
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "PriceMustBeAboveZero"
          );
        });
      });

      describe("cancelListing", function () {
        it("reverts if there is no listing", async function () {
          await expect(
            nftMarketplace.cancelListing(await basicNft.getAddress(), TOKEN_ID)
          ).to.be.revertedWithCustomError(nftMarketplace, "NotListed");
        });
        it("reverts if anyone but the owner tries to call", async function () {
          await nftMarketplace.listItem(
            await basicNft.getAddress(),
            TOKEN_ID,
            PRICE
          );
          nftMarketplace = await nftMarketplaceContract.connect(user);
          await expect(
            nftMarketplace.cancelListing(await basicNft.getAddress(), TOKEN_ID)
          ).to.be.revertedWithCustomError(nftMarketplace, "NotOwner");
        });
        it("emits event and removes listing", async function () {
          await nftMarketplace.listItem(
            await basicNft.getAddress(),
            TOKEN_ID,
            PRICE
          );
          await expect(
            nftMarketplace.cancelListing(await basicNft.getAddress(), TOKEN_ID)
          ).to.emit(nftMarketplace, "ItemCanceled");
          const listing = await nftMarketplace.getListing(
            await basicNft.getAddress(),
            TOKEN_ID
          );
          assert(listing.price.toString() == "0");
          assert(listing.seller.toString() == ethers.ZeroAddress);
        });
      });

      describe("buyItem", function () {
        it("reverts if the item isnt listed", async function () {
          await expect(
            nftMarketplace.buyItem(await basicNft.getAddress(), TOKEN_ID)
          ).to.be.revertedWithCustomError(nftMarketplace, "NotListed");
        });
        it("reverts if the price isnt met", async function () {
          await nftMarketplace.listItem(
            await basicNft.getAddress(),
            TOKEN_ID,
            PRICE
          );
          await expect(
            nftMarketplace.buyItem(await basicNft.getAddress(), TOKEN_ID, {
              value: ethers.parseEther("0.05"), // Send less than price
            })
          ).to.be.revertedWithCustomError(nftMarketplace, "PriceNotMet");
        });
        it("transfers the nft to the buyer and updates internal proceeds record", async function () {
          await nftMarketplace.listItem(
            await basicNft.getAddress(),
            TOKEN_ID,
            PRICE
          );
          nftMarketplace = await nftMarketplaceContract.connect(user);
          await expect(
            nftMarketplace.buyItem(await basicNft.getAddress(), TOKEN_ID, {
              value: PRICE,
            })
          ).to.emit(nftMarketplace, "ItemBought");
          const newOwner = await basicNft.ownerOf(TOKEN_ID);
          const deployerProceeds = await nftMarketplace.getProceeds(
            deployer.address
          );
          assert(newOwner.toString() == user.address);
          assert(deployerProceeds.toString() == PRICE.toString());
        });
      });

      describe("updateListing", function () {
        it("must be owner and listed", async function () {
          await expect(
            nftMarketplace.updateListing(
              await basicNft.getAddress(),
              TOKEN_ID,
              PRICE
            )
          ).to.be.revertedWithCustomError(nftMarketplace, "NotListed");
          await nftMarketplace.listItem(
            await basicNft.getAddress(),
            TOKEN_ID,
            PRICE
          );
          nftMarketplace = await nftMarketplaceContract.connect(user);
          await expect(
            nftMarketplace.updateListing(
              await basicNft.getAddress(),
              TOKEN_ID,
              PRICE
            )
          ).to.be.revertedWithCustomError(nftMarketplace, "NotOwner");
        });
        it("reverts if new price is 0", async function () {
          const updatedPrice = ethers.parseEther("0");
          await nftMarketplace.listItem(
            await basicNft.getAddress(),
            TOKEN_ID,
            PRICE
          );
          await expect(
            nftMarketplace.updateListing(
              await basicNft.getAddress(),
              TOKEN_ID,
              updatedPrice
            )
          ).to.be.revertedWithCustomError(
            nftMarketplace,
            "PriceMustBeAboveZero"
          );
        });
        it("updates the price of the item", async function () {
          const updatedPrice = ethers.parseEther("0.2");
          await nftMarketplace.listItem(
            await basicNft.getAddress(),
            TOKEN_ID,
            PRICE
          );
          await expect(
            nftMarketplace.updateListing(
              await basicNft.getAddress(),
              TOKEN_ID,
              updatedPrice
            )
          ).to.emit(nftMarketplace, "ItemListed");
          const listing = await nftMarketplace.getListing(
            await basicNft.getAddress(),
            TOKEN_ID
          );
          assert(listing.price.toString() == updatedPrice.toString());
        });
      });

      describe("withdrawProceeds", function () {
        it("doesn't allow 0 proceed withdrawls", async function () {
          await expect(
            nftMarketplace.withdrawProceeds()
          ).to.be.revertedWithCustomError(nftMarketplace, "NoProceeds");
        });
        it("withdraws proceeds", async function () {
          await nftMarketplace.listItem(
            await basicNft.getAddress(),
            TOKEN_ID,
            PRICE
          );
          nftMarketplace = await nftMarketplaceContract.connect(user);
          await nftMarketplace.buyItem(await basicNft.getAddress(), TOKEN_ID, {
            value: PRICE,
          });
          nftMarketplace = await nftMarketplaceContract.connect(deployer);

          const deployerProceedsBefore = await nftMarketplace.getProceeds(
            deployer.address
          );
          const deployerBalanceBefore = await ethers.provider.getBalance(
            deployer.address
          );
          const txResponse = await nftMarketplace.withdrawProceeds();
          const transactionReceipt = await txResponse.wait(1);
          const gasCost =
            transactionReceipt.gasUsed * transactionReceipt.gasPrice;
          const deployerBalanceAfter = await ethers.provider.getBalance(
            deployer.address
          );

          assert(
            (deployerBalanceAfter + gasCost).toString() ==
              (deployerProceedsBefore + deployerBalanceBefore).toString()
          );
        });
      });
    });
