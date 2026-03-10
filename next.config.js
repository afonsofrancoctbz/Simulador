/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Descomente para GitHub Pages
  // basePath: '/Simulator-reforma-tributaria', // Descomente para GitHub Pages
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'www.contabilizei.com.br' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'logodownload.org' },
      { protocol: 'https', hostname: 'escolaconquer.com.br' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'sociilaw.com' },
      { protocol: 'https', hostname: 'cdn.melhoreshospedagem.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
