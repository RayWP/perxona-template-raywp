import type { NextConfig } from "next";

function configuredDevOrigins() {
  const values = [process.env.CORS_ALLOWED_ORIGINS, process.env.NEXT_ALLOWED_DEV_ORIGINS]
    .flatMap((value) => value?.split(",") || [])
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value).hostname;
      } catch {
        return value.replace(/^https?:\/\//, "").split("/")[0];
      }
    });
  return [...new Set(values)];
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next 16 expects hostnames here, while CORS_ALLOWED_ORIGINS uses full
  // origins. Convert both forms so a Tailscale dev hostname can load Next's
  // development assets through `tailscale serve`.
  allowedDevOrigins: configuredDevOrigins(),
};

export default nextConfig;
