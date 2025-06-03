import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    allowedDevOrigins: ['127.0.0.1', 'localhost'],

    // Arduino通信用のCORS設定（本番環境用）
    async headers() {
        return [
            {
                // すべてのAPIルートに適用
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*', // 本番環境では特定のドメインに制限することを推奨
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, POST, PUT, DELETE, OPTIONS',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'Content-Type, Authorization',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;