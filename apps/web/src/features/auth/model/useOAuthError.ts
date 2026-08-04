"use client";
import { useSearchParams } from "next/navigation";
import { OAUTH_ERROR_CODES, OAuthErrorCodeSchema, type OAuthErrorCode } from "@rooms/contracts/auth";

const OAUTH_ERROR_MESSAGES: Record<OAuthErrorCode, string> = {
	[OAUTH_ERROR_CODES.cancelled]: "Sign-in was cancelled",
	[OAUTH_ERROR_CODES.invalidState]: "Sign-in request expired. Please try again",
	[OAUTH_ERROR_CODES.accountExists]:
		"This email is already linked to another sign-in method. Use that one instead.",
	[OAUTH_ERROR_CODES.failed]: "Sign-in failed. Please try again",
};

/** Reads the `?error=` code the API sets when an OAuth callback fails. */
export function useOAuthError(): string | null {
	const searchParams = useSearchParams();
	const code = searchParams.get("error");

	if (!code) {
		return null;
	}

	const parsed = OAuthErrorCodeSchema.safeParse(code);

	return parsed.success
		? OAUTH_ERROR_MESSAGES[parsed.data]
		: OAUTH_ERROR_MESSAGES[OAUTH_ERROR_CODES.failed];
}
