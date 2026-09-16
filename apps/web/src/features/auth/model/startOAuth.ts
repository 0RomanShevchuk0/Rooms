"use client";

import { useSearchParams } from "next/navigation";
import { NEXT_PARAM, sanitizeNextPath } from "@/shared/lib/next-path";
import type { OAuthProvider } from "./types";

const providerToEndpoint: Record<OAuthProvider, string> = {
	google: "/api/auth/google",
	discord: "/api/auth/discord",
};

export function startOAuth(provider: OAuthProvider, nextPath: string | null) {
	const url = new URL(providerToEndpoint[provider], window.location.origin);
	if (nextPath) url.searchParams.set(NEXT_PARAM, nextPath);

	window.location.assign(url.toString());
}

/** `startOAuth` bound to the `?next=` of the current sign-in page. */
export function useStartOAuth() {
	const searchParams = useSearchParams();
	const nextPath = sanitizeNextPath(searchParams.get(NEXT_PARAM));

	return (provider: OAuthProvider) => startOAuth(provider, nextPath);
}
