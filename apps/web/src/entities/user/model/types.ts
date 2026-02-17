import type { Room } from "@/entities/room";

export interface User {
	id: string;
	username: string;
	email?: string;
	name?: string;
	deletedAt?: Date | null;
}

export interface UserWithRooms extends User {
	rooms: Room[];
}
