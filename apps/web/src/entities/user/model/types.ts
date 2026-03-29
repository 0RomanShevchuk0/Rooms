export interface User {
	id: string;
	username: string;
	email?: string | null;
	name?: string | null;
	deletedAt?: string | null;
}
