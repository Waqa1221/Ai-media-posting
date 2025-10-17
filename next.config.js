const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack configuration for optional dependencies
  webpack: (config, { isServer }) => {
    // Handle optional dependencies for ws module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'utf-8-validate': false,
      'bufferutil': false,
    }
    
    // Ignore optional dependencies warnings
    config.ignoreWarnings = [
      { module: /node_modules\/ws\/lib\/validation\.js/ },
      { module: /node_modules\/ws\/lib\/websocket\.js/ },
      { module: /node_modules\/@supabase\/realtime-js/ },
      /Critical dependency: the request of a dependency is an expression/,
    ]
    
    return config
  },
  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  optimizeFonts: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Reduce bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
  images: { 
    unoptimized: true,
    domains: ['images.unsplash.com', 'pexels.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      }
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ['@sentry/nextjs', '@supabase/supabase-js'],
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

module.exports = withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    automaticVercelMonitors: true,
  }
)