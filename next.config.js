/** @type {import('next').NextConfig} */
const nextConfig = {
  // ADICIONE ESTA LINHA OBRIGATÓRIA PARA APP HOSTING
  output: 'standalone', 
  
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.contabilizei.com.br', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'sociilaw.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'storage.googleapis.com', port: '', pathname: '/**' },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    serverComponentsExternalPackages: [
      'genkit',
      '@genkit-ai/googleai',
      '@opentelemetry/instrumentation',
    ],
  },
};

module.exports = nextConfig;
