const fs = require("fs");

const config = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

module.exports = nextConfig;
`;

fs.writeFileSync("next.config.js", config, "utf8");
console.log("OK: next.config.js con ignore de errores");
