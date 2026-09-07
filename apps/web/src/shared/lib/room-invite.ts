import { ROUTES } from "@/shared/routes";

export const INVITE_PARAM = "invite";

export function buildRoomInviteUrl(roomId: string): string {
	const url = new URL(ROUTES.rooms.room(roomId), window.location.origin);
	url.searchParams.set(INVITE_PARAM, roomId);

	return url.toString();
}

/**
 * The param carries the room it was issued for, so a link copied out of one
 * room does not act as an invite to another.
 */
export function isInviteForRoom(inviteParam: string | null, roomId: string): boolean {
	return Boolean(inviteParam) && inviteParam === roomId;
}
