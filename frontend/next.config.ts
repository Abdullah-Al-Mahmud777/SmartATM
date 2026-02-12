/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Allowed dev origins for CORS in dev mode
  allowedDevOrigins: ['http://192.168.0.101:3000'],
};

module.exports = nextConfig;
