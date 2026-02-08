import type { User } from "@/entities/user";

export interface Room {
	id: string;
	name: string;
	description?: string;
}

export interface RoomWithPlayers extends Room {
	players: User[];
}
