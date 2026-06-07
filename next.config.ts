const nextConfig = {
  generateBuildId: () => `build-${new Date().getTime()}`,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  cacheComponents: true,
};

export default nextConfig;
