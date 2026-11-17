/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@zapeat/shared-types', '@zapeat/design-tokens', '@cookii/shared-types'],
};

module.exports = nextConfig;


