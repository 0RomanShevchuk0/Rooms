"use client";

import type { PropsWithChildren } from "react";
import { initSessionApiBridge, useRefreshToken } from "@/entities/session";

initSessionApiBridge();

export function SessionProvider({ children }: PropsWithChildren) {
	useRefreshToken();

	return children;
}
