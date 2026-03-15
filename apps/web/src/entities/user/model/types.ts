export interface User {
	id: string;
	username: string;
	email?: string;
	name?: string;
	deletedAt?: Date | null;
}
