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
        protocol: "https",
        hostname: "ucarecdn.com",
      },
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
      // H&M images
      {
        protocol: "https",
        hostname: "lp2.hm.com",
      },
      {
        protocol: "https",
        hostname: "image.hm.com",
      },
      // Gucci images
      {
        protocol: "https",
        hostname: "media.gucci.com",
        pathname: "**",
      },
      // Vitkac images
      {
        protocol: "https",
        hostname: "img.vitkac.com",
      },
    ],
  },
};

export default config;
