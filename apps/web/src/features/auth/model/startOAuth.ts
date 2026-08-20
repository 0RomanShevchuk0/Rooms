import type { OAuthProvider } from "./types";

const providerToEndpoint: Record<OAuthProvider, string> = {
	google: "/api/auth/google",
	discord: "/api/auth/discord",
};

export function startOAuth(provider: OAuthProvider) {
	window.location.assign(providerToEndpoint[provider]);
}
