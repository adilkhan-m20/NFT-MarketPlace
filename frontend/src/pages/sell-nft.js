import { useState, useEffect } from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { parseEther } from "viem";
import toast from "react-hot-toast";
import { formatEther } from "viem";

import nftAbi from "../constants/BasicNft.json";
import nftMarketplaceAbi from "../constants/NFTMarketPlace.json";
import networkMapping from "../constants/networkMapping.json";

export default function SellNFT() {
  const { address: account, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [nftAddress, setNftAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");
  const [proceeds, setProceeds] = useState("0");

  const chainString = chainId ? chainId.toString() : null;
  const marketplaceAddress =
    chainId && networkMapping[chainString]?.NftMarketplace
      ? networkMapping[chainString].NftMarketplace[0]
      : null;

  // 🔹 Approve + List NFT
  async function approveAndList(e) {
    e.preventDefault();

    if (!walletClient) {
      toast.error("Connect wallet first");
      return;
    }

    try {
      const priceInWei = parseEther(price);

      // 1. Approve
      const approveTx = await walletClient.writeContract({
        address: nftAddress,
        abi: nftAbi,
        functionName: "approve",
        args: [marketplaceAddress, tokenId],
      });

      await publicClient.waitForTransactionReceipt({ hash: approveTx });

      // 2. List
      const listTx = await walletClient.writeContract({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "listItem",
        args: [nftAddress, tokenId, priceInWei],
      });

      await publicClient.waitForTransactionReceipt({ hash: listTx });

      toast.success("NFT listed successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Transaction failed");
    }
  }

  // 🔹 Get proceeds
  async function fetchProceeds() {
    if (!account || !marketplaceAddress) return;

    try {
      const result = await publicClient.readContract({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "getProceeds",
        args: [account],
      });

      setProceeds(result.toString());
    } catch (err) {
      console.log(err);
    }
  }

  // 🔹 Withdraw
  async function handleWithdraw() {
    if (!walletClient) {
      toast.error("Connect wallet first");
      return;
    }

    try {
      const tx = await walletClient.writeContract({
        address: marketplaceAddress,
        abi: nftMarketplaceAbi,
        functionName: "withdrawProceeds",
      });

      await publicClient.waitForTransactionReceipt({ hash: tx });

      toast.success("Proceeds withdrawn!");
      fetchProceeds();
    } catch (error) {
      console.log(error);
      toast.error("Withdraw failed");
    }
  }

  useEffect(() => {
    fetchProceeds();
  }, [account, chainId]);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Sell your NFT</h2>

      <form onSubmit={approveAndList} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="NFT Address"
          value={nftAddress}
          onChange={(e) => setNftAddress(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Price (ETH)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border p-2 rounded"
        />

        <button className="bg-blue-500 text-white p-2 rounded">List NFT</button>
      </form>

      <div className="mt-6">
        <p className="mb-2">Proceeds: {formatEther(proceeds)} ETH</p>

        {proceeds !== "0" ? (
          <button
            onClick={handleWithdraw}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Withdraw
          </button>
        ) : (
          <p>No proceeds detected</p>
        )}
      </div>
    </div>
  );
}
