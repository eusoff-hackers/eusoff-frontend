/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // formats: ["image/png"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
