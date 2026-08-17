import type { NextConfig } from "next";
import path from "path";

const monorepoRoot = path.resolve(__dirname, "../..");
const apiOrigin = (process.env.API_ORIGIN ?? "http://localhost:4000").replace(/\/$/, "");

const nextConfig: NextConfig = {
	// Bundles the server and only the traced dependencies into .next/standalone,
	// so the runtime image does not need node_modules or the Next CLI.
	output: "standalone",
	outputFileTracingRoot: monorepoRoot,
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
