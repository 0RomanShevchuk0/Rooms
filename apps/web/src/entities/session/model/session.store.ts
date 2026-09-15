import { api } from "@/shared/api";
import { create } from "zustand";

interface SessionState {
	accessToken: string | null;
	/** True once the initial refresh has settled, with or without a token. */
	isInitialized: boolean;
	setAccessToken: (accessToken: string) => void;
	clearSession: () => void;
	markInitialized: () => void;
}

export const useSession = create<SessionState>((set) => ({
	accessToken: null,
	isInitialized: false,
	setAccessToken: (accessToken) => {
		set({ accessToken });
		api.setAccessToken(accessToken);
	},
	clearSession: () => {
		set({ accessToken: null });
		api.setAccessToken(null);
	},
	markInitialized: () => set({ isInitialized: true }),
}));
