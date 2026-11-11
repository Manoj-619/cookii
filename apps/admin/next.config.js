/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@cookii/shared-types', '@cookii/design-tokens'],
};

module.exports = nextConfig;

