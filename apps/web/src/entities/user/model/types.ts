import type { Room } from "@/entities/room";

export interface User {
	id: string;
	email?: string;
	name: string;
}

export interface UserWithRooms extends User {
	rooms: Room[];
}
