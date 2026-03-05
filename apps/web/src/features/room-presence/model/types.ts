import type { User } from "@/entities/user";

export interface RoomPresenceData {
	playerId: string;
	onlinePlayerIds: string[];
}

export interface RoomPlayerJoinedData extends RoomPresenceData {
	player: User;
}
