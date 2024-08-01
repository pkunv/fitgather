/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        // Kinde Auth fallback avatar
        protocol: "https",
        hostname: "gravatar.com",
      },
      {
        // Kinde Auth avatar for all social connections
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Zalando images
      {
        protocol: "https",
        hostname: "img01.ztat.net",
      },
      // Vinted images
      {
        protocol: "https",
        hostname: "images1.vinted.net",
      },
    ],
  },
};

export default config;
