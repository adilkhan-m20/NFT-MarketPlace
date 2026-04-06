import "../styles/globals.css";
import Head from "next/head";
import Header from "../components/Header";

import { ApolloProvider } from "@apollo/client/react";
import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "react-hot-toast";

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message }) =>
      console.log("[GraphQL error]:", message),
    );
  if (networkError) console.log("[Network error]:", networkError);
});

const httpLink = new HttpLink({
  uri: "https://api.studio.thegraph.com/query/1747421/nft-marketplace/version/latest",
  headers: {
    Authorization: "Bearer 3b19c3f1d6dffaf4004fdb42bbcbcdb4",
  },
});

const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
});

const wagmiConfig = getDefaultConfig({
  appName: "NFT Marketplace",
  projectId: "7903da26ddcca36d97bf2006d08795ae",
  chains: [sepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>NFT Marketplace</title>
        <meta name="description" content="NFT Marketplace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <ApolloProvider client={apolloClient}>
              <Toaster position="top-right" />
              <Header />
              <Component {...pageProps} />
            </ApolloProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}
