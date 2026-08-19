"use client";

import { useEffect } from "react";

const buildSha = process.env.NEXT_PUBLIC_BUILD_SHA;

/**
 * Logs which commit the running bundle was built from. Renders nothing, and
 * stays silent unless the build actually stamped a SHA, so local development
 * and the console both stay clean.
 */
export function BuildInfo() {
	useEffect(() => {
		if (buildSha) {
			console.info(`Rooms build: ${buildSha}`);
		}
	}, []);

	return null;
}
