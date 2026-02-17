import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-webfonts",
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
          },
        },
      },
      {
        urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "weather-api",
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60, // 1 hour
          }
        }
      }
    ],
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // swcMinify is default in Next 15
  // compress is default true in Next 15

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.openweathermap.org',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Remove console logs in production for performance
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default withPWA(nextConfig);
