export const queryKeys = {
	rooms: {
		all: () => ["rooms"] as const,
		byId: (id: string) => ["rooms", id] as const,
	},
} as const;

export const mutationKeys = {
	auth: {
		login: () => ["auth", "login"] as const,
		register: () => ["auth", "register"] as const,
	},
} as const;
