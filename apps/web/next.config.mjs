import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/types", "@repo/schemas", "@repo/utils"],
  experimental: {
    turbo: {
      resolveAlias: {
        "@repo/types": "../../packages/types/src",
        "@repo/schemas": "../../packages/schemas/src",
        "@repo/utils": "../../packages/utils/src",
      },
    },
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});

