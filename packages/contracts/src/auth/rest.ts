import { z } from "zod";

export const AuthCredentialsSchema = z.object({
	username: z.string().min(1),
	password: z.string().min(1),
});

export const AuthTokenResponseSchema = z.object({
	access_token: z.string(),
});

export const AuthRefreshTokensErrorResponseSchema = z.object({
	error: z.string(),
});

export const AuthRefreshTokensResponseSchema = z.union([
	AuthTokenResponseSchema,
	AuthRefreshTokensErrorResponseSchema,
]);

export const AuthLogoutResponseSchema = z.object({
	message: z.string(),
});

export const OAUTH_ERROR_CODES = {
	cancelled: "oauth_cancelled",
	invalidState: "oauth_invalid_state",
	accountExists: "oauth_account_exists",
	failed: "oauth_failed",
} as const;

export const OAuthErrorCodeSchema = z.enum([
	OAUTH_ERROR_CODES.cancelled,
	OAUTH_ERROR_CODES.invalidState,
	OAUTH_ERROR_CODES.accountExists,
	OAUTH_ERROR_CODES.failed,
]);

export type AuthCredentials = z.infer<typeof AuthCredentialsSchema>;
export type AuthTokenResponse = z.infer<typeof AuthTokenResponseSchema>;
export type AuthRefreshTokensErrorResponse = z.infer<
	typeof AuthRefreshTokensErrorResponseSchema
>;
export type AuthRefreshTokensResponse = z.infer<
	typeof AuthRefreshTokensResponseSchema
>;
export type AuthLogoutResponse = z.infer<typeof AuthLogoutResponseSchema>;
export type OAuthErrorCode = z.infer<typeof OAuthErrorCodeSchema>;
