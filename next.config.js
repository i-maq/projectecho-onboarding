/** next.config.js **/
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack config (Next.js 16 default bundler)
  turbopack: {
    resolveAlias: {
      bufferutil: { browser: '' },
      'utf-8-validate': { browser: '' },
    },
  },
  // Webpack fallback (used with --webpack flag)
  webpack(config) {
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      bufferutil: false,
      'utf-8-validate': false,
    };
    return config;
  },
};

module.exports = nextConfig;
