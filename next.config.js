/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure Node.js runtime for API routes (fs access for Excel)
  experimental: {},
};

module.exports = nextConfig;

