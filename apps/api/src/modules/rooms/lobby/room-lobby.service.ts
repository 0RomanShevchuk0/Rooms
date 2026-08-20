import EventEmitter from 'node:events';
import { Injectable } from '@nestjs/common';

export const GATHERING_WINDOW_SECONDS = 15;
export const GATHERING_TICK_MS = 1_000;
export const MIN_PLAYERS = 1;

export const ROOM_PHASE = {
	LOBBY: 'lobby',
	GATHERING: 'gathering',
	RUNNING: 'running',
} as const;

export type RoomPhase = (typeof ROOM_PHASE)[keyof typeof ROOM_PHASE];

export interface RoomLobbyState {
	phase: RoomPhase;
	readyParticipantIds: string[];
	/** Counted down by the server, so no client has to trust its own clock. */
	windowSecondsLeft: number | null;
}

type RoomLobbyEvents = {
	stateChanged: [roomId: string, state: RoomLobbyState];
	matchStart: [roomId: string, playerIds: string[]];
};

interface RoomLobbyEntry {
	phase: RoomPhase;
	readyParticipantIds: Set<string>;
	windowSecondsLeft: number | null;
	windowTimer: NodeJS.Timeout | null;
}

/**
 * Who is ready to play, and the window in which they can sign up. Session state
 * only: it lives beside presence in memory and is gone on restart.
 */
@Injectable()
export class RoomLobbyService extends EventEmitter<RoomLobbyEvents> {
	private rooms = new Map<string, RoomLobbyEntry>();

	getState(roomId: string): RoomLobbyState {
		const room = this.rooms.get(roomId);
		if (!room) {
			return {
				phase: ROOM_PHASE.LOBBY,
				readyParticipantIds: [],
				windowSecondsLeft: null,
			};
		}

		return {
			phase: room.phase,
			readyParticipantIds: Array.from(room.readyParticipantIds),
			windowSecondsLeft: room.windowSecondsLeft,
		};
	}

	/**
	 * The first ready participant opens the gathering window. It closes early once
	 * everyone online is ready, which is what makes a solo game start instantly.
	 */
	setReady(
		roomId: string,
		participantId: string,
		isReady: boolean,
		onlineParticipantIds: string[],
	) {
		const room = this.getOrCreateRoom(roomId);
		if (room.phase === ROOM_PHASE.RUNNING) {
			return;
		}

		if (!isReady) {
			this.dropReadyParticipant(roomId, room, participantId);
			return;
		}

		room.readyParticipantIds.add(participantId);

		if (room.phase === ROOM_PHASE.LOBBY) {
			this.openWindow(roomId, room);
		}

		if (this.isEveryoneOnlineReady(room, onlineParticipantIds)) {
			this.closeWindow(roomId);
			return;
		}

		this.emitState(roomId);
	}

	/**
	 * Losing the last socket gives up the spot. Unlike {@link setReady} this never
	 * closes the window early: someone else leaving must not start a match sooner
	 * than the people who signed up expect.
	 */
	clearReady(roomId: string, participantId: string) {
		const room = this.rooms.get(roomId);
		if (!room || room.phase === ROOM_PHASE.RUNNING) {
			return;
		}

		this.dropReadyParticipant(roomId, room, participantId);
	}

	/** Skips the rest of the window. Only someone already playing may. */
	startNow(roomId: string, participantId: string) {
		const room = this.rooms.get(roomId);
		if (
			!room ||
			room.phase !== ROOM_PHASE.GATHERING ||
			!room.readyParticipantIds.has(participantId)
		) {
			return;
		}

		this.closeWindow(roomId);
	}

	/** Back to square one: everyone signs up again for the next match. */
	endMatch(roomId: string) {
		const room = this.rooms.get(roomId);
		if (!room || room.phase !== ROOM_PHASE.RUNNING) {
			return;
		}

		room.readyParticipantIds.clear();
		room.phase = ROOM_PHASE.LOBBY;
		this.emitState(roomId);
		this.pruneRoom(roomId, room);
	}

	/** For a room that is going away; drops the pending timer with it. */
	dispose(roomId: string) {
		const room = this.rooms.get(roomId);
		if (!room) {
			return;
		}

		this.clearWindowTimer(room);
		this.rooms.delete(roomId);
	}

	private dropReadyParticipant(
		roomId: string,
		room: RoomLobbyEntry,
		participantId: string,
	) {
		if (!room.readyParticipantIds.delete(participantId)) {
			return;
		}

		if (
			room.phase === ROOM_PHASE.GATHERING &&
			room.readyParticipantIds.size === 0
		) {
			this.cancelWindow(room);
		}

		this.emitState(roomId);
		this.pruneRoom(roomId, room);
	}

	private openWindow(roomId: string, room: RoomLobbyEntry) {
		room.phase = ROOM_PHASE.GATHERING;
		room.windowSecondsLeft = GATHERING_WINDOW_SECONDS;
		room.windowTimer = setInterval(
			() => this.tickWindow(roomId),
			GATHERING_TICK_MS,
		);
	}

	/** Counted down on the wire, so nobody has to count for themselves. */
	private tickWindow(roomId: string) {
		const room = this.rooms.get(roomId);
		if (!room || room.phase !== ROOM_PHASE.GATHERING) {
			return;
		}

		room.windowSecondsLeft = (room.windowSecondsLeft ?? 0) - 1;

		if (room.windowSecondsLeft <= 0) {
			this.closeWindow(roomId);
			return;
		}

		this.emitState(roomId);
	}

	private closeWindow(roomId: string) {
		const room = this.rooms.get(roomId);
		if (!room || room.phase !== ROOM_PHASE.GATHERING) {
			return;
		}

		const playerIds = Array.from(room.readyParticipantIds);
		if (playerIds.length < MIN_PLAYERS) {
			this.cancelWindow(room);
			this.emitState(roomId);
			this.pruneRoom(roomId, room);
			return;
		}

		this.clearWindowTimer(room);
		room.phase = ROOM_PHASE.RUNNING;
		room.windowSecondsLeft = null;

		this.emitState(roomId);
		this.emit('matchStart', roomId, playerIds);
	}

	private cancelWindow(room: RoomLobbyEntry) {
		this.clearWindowTimer(room);
		room.phase = ROOM_PHASE.LOBBY;
		room.windowSecondsLeft = null;
	}

	private clearWindowTimer(room: RoomLobbyEntry) {
		if (room.windowTimer) {
			clearInterval(room.windowTimer);
			room.windowTimer = null;
		}
	}

	private isEveryoneOnlineReady(
		room: RoomLobbyEntry,
		onlineParticipantIds: string[],
	): boolean {
		if (onlineParticipantIds.length === 0) {
			return false;
		}

		return onlineParticipantIds.every((participantId) =>
			room.readyParticipantIds.has(participantId),
		);
	}

	private emitState(roomId: string) {
		this.emit('stateChanged', roomId, this.getState(roomId));
	}

	private getOrCreateRoom(roomId: string): RoomLobbyEntry {
		const existingRoom = this.rooms.get(roomId);
		if (existingRoom) {
			return existingRoom;
		}

		const room: RoomLobbyEntry = {
			phase: ROOM_PHASE.LOBBY,
			readyParticipantIds: new Set(),
			windowSecondsLeft: null,
			windowTimer: null,
		};
		this.rooms.set(roomId, room);

		return room;
	}

	/** An idle lobby is indistinguishable from a room we have never seen. */
	private pruneRoom(roomId: string, room: RoomLobbyEntry) {
		if (
			room.phase === ROOM_PHASE.LOBBY &&
			room.readyParticipantIds.size === 0
		) {
			this.rooms.delete(roomId);
		}
	}
}
