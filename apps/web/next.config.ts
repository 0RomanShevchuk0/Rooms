import type { NextConfig } from "next";
import path from "path";

const monorepoRoot = path.resolve(__dirname, "../..");
const apiOrigin = (process.env.API_ORIGIN ?? "http://localhost:4000").replace(/\/$/, "");

const nextConfig: NextConfig = {
	turbopack: {
		root: path.resolve(monorepoRoot),
	},
	rewrites: async () => {
		return [
			{
				source: "/api/:path*",
				destination: `${apiOrigin}/api/:path*`,
			},
		];
	},
};

export default nextConfig;
