export const ROUTES = {
	home: "/",

	auth: {
		login: "/auth/login",
		register: "/auth/register",
	},

	rooms: {
		list: "/rooms",
		room: (id: string) => `/rooms/${id}`,
	},
} as const;
