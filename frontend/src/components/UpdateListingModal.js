import { useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import toast from "react-hot-toast";

import nftMarketPlaceAbi from "../constants/NFTMarketPlace.json";

export default function UpdateListingModal({
  nftAddress,
  tokenId,
  isVisible,
  marketplaceAddress,
  onClose,
}) {
  const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState("");

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  if (!isVisible) return null;

  // Update listing
  async function handleUpdateListing() {
    if (!walletClient) {
      toast.error("Connect wallet first");
      return;
    }

    try {
      const price = ethers.parseEther(priceToUpdateListingWith);

      const hash = await walletClient.writeContract({
        address: marketplaceAddress,
        abi: nftMarketPlaceAbi,
        functionName: "updateListing",
        args: [nftAddress, tokenId, price],
      });

      await publicClient.waitForTransactionReceipt({ hash });

      toast.success("Listing updated successfully!");
      onClose && onClose();
      setPriceToUpdateListingWith("");
    } catch (error) {
      console.log(error);
      toast.error("Update failed");
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-80">
        <h2 className="text-lg font-bold mb-4">Update Listing</h2>

        <input
          type="text"
          placeholder="Enter new price in ETH"
          value={priceToUpdateListingWith}
          onChange={(e) => setPriceToUpdateListingWith(e.target.value)}
          className="border p-2 w-full mb-4"
        />

        <div className="flex justify-between">
          <button
            onClick={handleUpdateListing}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Update
          </button>

          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
