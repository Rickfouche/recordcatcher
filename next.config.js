/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ❌ no: output: 'export'
  // Netlify’s Next plugin handles SSR. Nothing special needed here.
};

module.exports = nextConfig;
