import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // A separate lockfile exists higher in this Windows user profile. Pinning
  // tracing here prevents Next.js from treating the whole profile as the app.
  outputFileTracingRoot: appRoot,
};

export default nextConfig;
