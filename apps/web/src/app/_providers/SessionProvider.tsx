"use client";

import type { PropsWithChildren } from "react";
import { useRefreshToken } from "@/entities/session";
import { FullWidthSpinnerLoader } from "@/shared/ui/spinner-loader";

export function SessionProvider({ children }: PropsWithChildren) {
	const { isInitialized } = useRefreshToken();

	if (!isInitialized) {
		return <FullWidthSpinnerLoader />;
	}

	return children;
}
