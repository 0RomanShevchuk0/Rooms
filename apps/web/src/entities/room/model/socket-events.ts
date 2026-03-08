export const ROOM_SOCKET_EVENTS = {
	CONNECT: 'room:connect',
	DISCONNECT: 'room:disconnect',
	PARTICIPANT_JOINED: 'room:participant_joined',
	PARTICIPANT_LEFT: 'room:participant_left',
} as const;
