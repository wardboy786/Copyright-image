/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Required for Capacitor to work with static exports
  trailingSlash: true,
};

export default nextConfig;
