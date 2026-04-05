/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["gateway.pinata.cloud", "ipfs.io", "dweb.link"],
  },
  output: "standalone",
};

module.exports = nextConfig;
