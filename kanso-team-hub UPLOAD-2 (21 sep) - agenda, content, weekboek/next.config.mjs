/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  images: { unoptimized: true },
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Frame-Options", value: "DENY" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};
export default nextConfig;
