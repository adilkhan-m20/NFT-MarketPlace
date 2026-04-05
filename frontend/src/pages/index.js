import { useEffect, useState } from "react";
import networkMapping from "../constants/networkMapping.json";
import GET_ACTIVE_ITEMS from "@/constants/subgraphQueries";
import NFTBox from "../components/NFTBox";
import { useQuery } from "@apollo/client/react";
import { useAccount, useChainId } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chainString = chainId ? chainId.toString() : null;

  const marketplaceAddress = chainId
    ? networkMapping[chainString]?.NftMarketplace?.[0]
    : null;

  const { loading, error, data } = useQuery(GET_ACTIVE_ITEMS);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Recently Listed
        </h1>

        {/* Wallet not connected */}
        {!isConnected && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Connect your wallet
            </h2>
            <p className="text-gray-400 text-sm">
              Connect your wallet to see listed NFTs
            </p>
          </div>
        )}

        {/* Loading */}
        {isConnected && loading && (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-500">Loading NFTs...</span>
          </div>
        )}

        {/* Error */}
        {isConnected && error && (
          <div className="flex items-center justify-center py-24">
            <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 text-red-600 text-sm">
              Failed to load NFTs. Check your network or subgraph.
            </div>
          </div>
        )}

        {/* No NFTs */}
        {isConnected && !loading && data && data.activeItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🖼️</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No NFTs listed yet
            </h2>
            <p className="text-gray-400 text-sm">
              Be the first to list an NFT on the marketplace
            </p>
          </div>
        )}

        {/* Wrong network */}
        {isConnected && !loading && data && !marketplaceAddress && (
          <div className="flex items-center justify-center py-24">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-6 py-4 text-yellow-700 text-sm">
              Wrong network detected. Please switch to Sepolia.
            </div>
          </div>
        )}

        {/* NFT Grid */}
        {isConnected && !loading && data && marketplaceAddress && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.activeItems.map((nft) => {
              const { price, nftAddress, tokenId, seller } = nft;
              return (
                <NFTBox
                  key={`${nftAddress}-${tokenId}`}
                  price={price}
                  nftAddress={nftAddress}
                  tokenId={tokenId}
                  marketplaceAddress={marketplaceAddress}
                  seller={seller}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}