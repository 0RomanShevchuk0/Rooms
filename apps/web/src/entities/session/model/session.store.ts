import { create } from "zustand";

interface SessionState {
	accessToken: string | null;
	setAccessToken: (accessToken: string) => void;
	clearSession: () => void;
}

export const useSession = create<SessionState>((set) => ({
	accessToken: null,
	setAccessToken: (accessToken) => set({ accessToken }),
	clearSession: () => set({ accessToken: null }),
}));
