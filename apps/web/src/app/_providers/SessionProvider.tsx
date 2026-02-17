"use client";

import type { PropsWithChildren } from "react";
import { initSessionApiBridge, useRefreshToken } from "@/entities/session";
import { FullWidthSpinnerLoader } from "@/shared/ui/spinner-loader";

initSessionApiBridge();

export function SessionProvider({ children }: PropsWithChildren) {
	const { isInitialized } = useRefreshToken();

	if (!isInitialized) {
		return <FullWidthSpinnerLoader />;
	}

	return children;
}
