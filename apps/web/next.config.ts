import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	turbopack: {
		root: path.resolve(__dirname),
	},
	// async rewrites() {
	// 	return [
	// 		{
	// 			source: "/api/socket.io/:path*",
	// 			destination: "http://localhost:4000/api/socket.io/:path*",
	// 		},
	// 		{
	// 			source: "/api/:path*",
	// 			destination: "http://localhost:4000/api/:path*",
	// 		},
	// 	];
	// },
};

export default nextConfig;
