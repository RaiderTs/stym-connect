/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'api.stymconnect.com',
      'source.unsplash.com',
    ],
  },
};

module.exports = nextConfig;
