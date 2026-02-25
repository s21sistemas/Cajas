/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',       // Genera export estático
  trailingSlash: true,    // Crea carpetas para cada ruta
  reactStrictMode: true,
}

export default nextConfig
