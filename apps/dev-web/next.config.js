// This configuration enables the standalone output mode for Next.js, application builds and runs.
// [[like the "setting file" for web app deployment]]

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};
// The output: 'standalone' setting tells Next.js to create a self-contained, portable application.

// --- BENEFITS ---
// Easy deployment to cloud platforms
// Consistent builds across different environments
// Simplified CI/CD pipeline (no need to install deps in production)
// Better performance in containerized environments

export default nextConfig;
