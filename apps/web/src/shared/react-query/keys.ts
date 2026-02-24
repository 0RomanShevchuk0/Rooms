export const queryKeys = {
	rooms: {
		all: () => ["rooms"] as const,
		byId: (id: string) => ["rooms", id] as const,
		my: () => ["rooms", "my"] as const,
	},
	user: {
		me: () => ["user", "me"] as const,
	},
} as const;

export const mutationKeys = {
	session: {
		refreshToken: () => ["session", "refresh-token"] as const,
	},
	auth: {
		login: () => ["auth", "login"] as const,
		register: () => ["auth", "register"] as const,
		logout: () => ["auth", "logout"] as const,
	},
	rooms: {
		create: () => ["rooms", "create"] as const,
		join: () => ["rooms", "join"] as const,
	},
} as const;
