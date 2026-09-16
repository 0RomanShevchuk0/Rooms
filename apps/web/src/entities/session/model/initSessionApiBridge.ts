import { api } from "@/shared/api";
import { configureSocketAuth } from "@/shared/lib/realtime";
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

	configureSocketAuth({
		getToken: () => useSession.getState().accessToken,
		subscribe: (listener) =>
			useSession.subscribe((state, previous) => {
				if (state.accessToken !== previous.accessToken) listener(state.accessToken);
			}),
		onUnauthorized: () => useSession.getState().clearSession(),
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
