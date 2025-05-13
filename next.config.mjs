import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants";
import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["your-firebase-image-source.com", "drive.google.com"], // Add all domains you need
  },
};

// PWA configuration
const withPWA = withPWAInit({
  dest: "public", // The location of your service worker
  register: true,
  skipWaiting: true,
});

export default (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    // Use PWA config only in production and development builds
    return withPWA(nextConfig);
  }
  return nextConfig; // Default config for other phases (e.g., preview)
};
