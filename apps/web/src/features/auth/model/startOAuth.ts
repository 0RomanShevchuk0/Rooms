import type { OAuthProvider } from "./types";

const providerToEndpoint: Record<OAuthProvider, string> = {
	google: "/api/auth/google",
};

export function startOAuth(provider: OAuthProvider) {
	window.location.assign(providerToEndpoint[provider]);
}
