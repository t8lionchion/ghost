/** @type {import('next').NextConfig} */
const nextConfig = {
    // 其他設定…
  env: {
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000',
  },
};

export default nextConfig;
