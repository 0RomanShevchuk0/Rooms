"use client";
import { useSearchParams } from "next/navigation";
import { OAUTH_ERROR_CODES, OAuthErrorCodeSchema, type OAuthErrorCode } from "@rooms/contracts/auth";

import { OAuthProvider } from "./types";

const OAUTH_ERROR_MESSAGES: Record<OAuthErrorCode, string> = {
	[OAUTH_ERROR_CODES.cancelled]: "Sign-in was cancelled",
	[OAUTH_ERROR_CODES.invalidState]: "Sign-in request expired. Please try again",
	[OAUTH_ERROR_CODES.accountExists]:
		"This email is already linked to another sign-in method. Use that one instead.",
	[OAUTH_ERROR_CODES.accountDeleted]:
		"The account for this email was deleted and cannot be used to sign in.",
	[OAUTH_ERROR_CODES.failed]: "Sign-in failed. Please try again",
};

const PROVIDER_LABELS: Record<OAuthProvider, string> = {
	[OAuthProvider.google]: "Google",
	[OAuthProvider.discord]: "Discord",
};

function getProviderLabel(provider: string | null): string | null {
	if (!provider || !(provider in PROVIDER_LABELS)) {
		return null;
	}

	return PROVIDER_LABELS[provider as OAuthProvider];
}

/** Reads the `?error=` code the API sets when an OAuth callback fails. */
export function useOAuthError(): string | null {
	const searchParams = useSearchParams();
	const code = searchParams.get("error");

	if (!code) {
		return null;
	}

	const parsed = OAuthErrorCodeSchema.safeParse(code);

	if (!parsed.success) {
		return OAUTH_ERROR_MESSAGES[OAUTH_ERROR_CODES.failed];
	}

	// The API tells us which method already owns the email whenever it knows.
	if (parsed.data === OAUTH_ERROR_CODES.accountExists) {
		const label = getProviderLabel(searchParams.get("provider"));
		if (label) {
			return `This email is already linked to your ${label} account. Continue with ${label} instead.`;
		}
	}

	return OAUTH_ERROR_MESSAGES[parsed.data];
}
