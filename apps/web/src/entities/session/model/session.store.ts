import { api } from "@/shared/api";
import { create } from "zustand";

interface SessionState {
	accessToken: string | null;
	setAccessToken: (accessToken: string) => void;
	clearSession: () => void;
}

export const useSession = create<SessionState>((set) => ({
	accessToken: null,
	setAccessToken: (accessToken) => {
		set({ accessToken });
		api.setAccessToken(accessToken);
	},
	clearSession: () => {
		set({ accessToken: null });
		api.setAccessToken(null);
	},
}));
