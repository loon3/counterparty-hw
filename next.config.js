/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
      blockcypherToken: '',
      defaultTxBytes: 249,
      minFeeSatoshis: 100,
      testMode: false
  },
  images: {
    domains: ['pepewtf.s3.amazonaws.com'],
  }
}

module.exports = nextConfig
