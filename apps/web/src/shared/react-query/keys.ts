export const queryKeys = {
	rooms: {
		all: () => ["rooms"] as const,
		byId: (id: string) => ["rooms", id] as const,
	},
} as const;

export const mutationKeys = {
	session: {
		refreshToken: () => ["session", "refresh-token"] as const,
	},
	auth: {
		login: () => ["auth", "login"] as const,
		register: () => ["auth", "register"] as const,
	},
} as const;
