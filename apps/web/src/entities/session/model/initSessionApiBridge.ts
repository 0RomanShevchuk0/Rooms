import { api } from "@/shared/api";
import { useSession } from "./session.store";
import { refreshTokens } from "../api/refresh-tokens";

let isBridgeInitialized = false;

export function initSessionApiBridge() {
	if (isBridgeInitialized) return;
	isBridgeInitialized = true;

	api.onTokenChange((token) => {
		useSession.setState({ accessToken: token });
	});

	api.onUnauthorized(() => {
		useSession.setState({ accessToken: null });
	});

	api.setRefreshHandler(async () => {
		try {
			const data = await refreshTokens();
			return "access_token" in data ? (data.access_token ?? null) : null;
		} catch {
			return null;
		}
	});
}
