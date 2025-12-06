/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.contabilizei.com.br',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sociilaw.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    // Fail the build on TypeScript errors
    ignoreBuildErrors: false,
  },
  // Adding this to prevent bundling errors with Genkit and its dependencies
  serverExternalPackages: [
    'genkit',
    '@genkit-ai/googleai',
    '@opentelemetry/instrumentation',
  ],
  experimental: {
    // This is required to allow requests from the Firebase Studio preview environment
    allowedDevOrigins: [
      'https://*.cloudworkstations.dev',
    ],
  }
};

module.exports = nextConfig;
