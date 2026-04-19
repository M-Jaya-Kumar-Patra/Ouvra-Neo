const nextConfig = {
  // Add this line inside your config object
  generateBuildId: () => `build-${new Date().getTime()}`,
  
  // Also ensure this is updated as per previous warnings
  cacheComponents: true,
};

export default nextConfig;