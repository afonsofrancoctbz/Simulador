/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Necessário para exportação estática no GitHub Pages
  basePath: '/Simulator-reforma-tributaria', // Nome do repositório no GitHub
  images: {
    unoptimized: true, // GitHub Pages não suporta o servidor de otimização de imagem do Next.js
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
    ignoreBuildErrors: true, // Garante que o deploy não pare por avisos de tipos
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
