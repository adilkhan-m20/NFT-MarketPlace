import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { formatEther } from "viem";
import toast from "react-hot-toast";

import nftArtifact from "../constants/BasicNft.json";
import nftMarketPlaceArtifact from "../constants/NFTMarketPlace.json";

const nftAbi = nftArtifact.abi;
const nftMarketPlaceAbi = nftMarketPlaceArtifact.abi;

const truncateStr = (fullStr, strLen) => {
  if (!fullStr) return "";
  if (fullStr.length <= strLen) return fullStr;
  const separator = "...";
  const charsToShow = strLen - separator.length;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return fullStr.substring(0, frontChars) + separator + fullStr.substring(fullStr.length - backChars);
};

export default function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
  const { address: account, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [imageURI, setImageURI] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [buying, setBuying] = useState(false);

  async function updateUI() {
    try {
      const tokenURI = await publicClient.readContract({
        address: nftAddress,
        abi: nftAbi,
        functionName: "tokenURI",
        args: [tokenId],
      });

      if (!tokenURI) return;

      // Normalize tokenURI to a fetchable URL
      let metadataURL = tokenURI;
      if (tokenURI.startsWith("ipfs://")) {
        metadataURL = `https://gateway.pinata.cloud/ipfs/${tokenURI.replace("ipfs://", "")}`;
      } else if (tokenURI.includes("/ipfs/")) {
        const cid = tokenURI.split("/ipfs/")[1];
        metadataURL = `https://gateway.pinata.cloud/ipfs/${cid}`;
      }

      const response = await fetch(metadataURL);
      const metadata = await response.json();

      // Image field — handle both ipfs:// and full https:// URLs
      let imageURL = metadata.image;
      if (imageURL.startsWith("ipfs://")) {
        imageURL = `https://gateway.pinata.cloud/ipfs/${imageURL.replace("ipfs://", "")}`;
      } else if (imageURL.includes("/ipfs/")) {
        const cid = imageURL.split("/ipfs/")[1];
        imageURL = `https://gateway.pinata.cloud/ipfs/${cid}`;
      }
      // If it's already a full https:// URL (like yours), use as-is ✅

      setImageURI(imageURL);
      setTokenName(metadata.name);
      setTokenDescription(metadata.description);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleBuyItem() {
    if (!walletClient) { toast.error("Connect wallet first"); return; }
    try {
      setBuying(true);
      const hash = await walletClient.writeContract({
        address: marketplaceAddress,
        abi: nftMarketPlaceAbi,
        functionName: "buyItem",
        args: [nftAddress, tokenId],
        value: price,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success("NFT bought successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Transaction failed");
    } finally {
      setBuying(false);
    }
  }

  useEffect(() => {
    if (isConnected) updateUI();
  }, [isConnected]);

  const isOwnedByUser = seller?.toLowerCase() === account?.toLowerCase();

  return (
    <div className="w-72 rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow duration-300">
      {/* Image */}
      <div className="relative w-full h-48 bg-gray-100">
        {imageURI ? (
          <img
            src={imageURI}
            alt={tokenName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Loading image...
          </div>
        )}

        {/* Price badge */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs font-semibold px-2 py-1 rounded-full">
          {formatEther(BigInt(price))} ETH
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Name + Token ID */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-gray-900 text-base truncate">
            {tokenName || `Token #${tokenId}`}
          </h3>
          <span className="text-xs text-gray-400 ml-2 shrink-0">#{tokenId}</span>
        </div>

        {/* Seller */}
        <p className="text-xs text-gray-400 mb-2">
          {isOwnedByUser ? (
            <span className="text-green-500 font-medium">Owned by you</span>
          ) : (
            <>Seller: {truncateStr(seller, 13)}</>
          )}
        </p>

        {/* Description */}
        {tokenDescription && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
            {tokenDescription}
          </p>
        )}

        {/* Buy button */}
        {!isOwnedByUser && (
          <button
            onClick={handleBuyItem}
            disabled={buying}
            className="w-full mt-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold py-2 rounded-xl transition-colors duration-200"
          >
            {buying ? "Buying..." : `Buy for ${formatEther(BigInt(price))} ETH`}
          </button>
        )}

        {isOwnedByUser && (
          <div className="w-full mt-1 text-center text-sm text-green-600 font-medium py-2 rounded-xl border border-green-200 bg-green-50">
            You own this NFT
          </div>
        )}
      </div>
    </div>
  );
}