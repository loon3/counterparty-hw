/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
      blockcypherToken: '',
      defaultTxBytes: 249,
      minFeeSatoshis: 100
  }
}

module.exports = nextConfig
