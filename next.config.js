/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_APP_NAME:
      process.env.NEXT_PUBLIC_APP_NAME || "Jarvis AI Assistant",
    NEXT_PUBLIC_AUTHOR_NAME:
      process.env.NEXT_PUBLIC_AUTHOR_NAME || "Krishna Bantola",
  },
};

module.exports = nextConfig;
