/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: '/oddsmith',
  trailingSlash: true,
};

module.exports = nextConfig;
