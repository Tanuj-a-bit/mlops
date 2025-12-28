import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['images.unsplash.com', 'fakestoreapi.com'],
        unoptimized: true,
    },
};

export default nextConfig;
