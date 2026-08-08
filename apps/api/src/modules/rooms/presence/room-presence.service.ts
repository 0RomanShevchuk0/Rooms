import { Injectable } from '@nestjs/common';

export interface RoomPresenceContext {
	roomId: string;
	participantId: string;
	/**
	 * Bumped every time the socket reconnects, so a disconnect that arrives late
	 * cannot clear the context a newer connection installed.
	 */
	sessionVersion: number;
}

@Injectable()
export class RoomPresenceService {
	/** roomId -> participantId -> socket ids */
	private roomParticipants = new Map<string, Map<string, Set<string>>>();
	private socketContexts = new Map<string, RoomPresenceContext>();

	getOnlineParticipantIds(roomId: string): string[] {
		return Array.from(this.roomParticipants.get(roomId)?.keys() ?? []);
	}

	/** Who a live socket belongs to, so handlers never take that on trust. */
	getContext(socketId: string): RoomPresenceContext | null {
		return this.socketContexts.get(socketId) ?? null;
	}

	attach(
		socketId: string,
		roomId: string,
		participantId: string,
	): RoomPresenceContext {
		const context: RoomPresenceContext = {
			roomId,
			participantId,
			sessionVersion: this.getNextSessionVersion(socketId),
		};

		this.socketContexts.set(socketId, context);
		this.addParticipantSocket(roomId, participantId, socketId);

		return context;
	}

	/** Keeps the context; only {@link releaseContext} may drop it. */
	detach(socketId: string): RoomPresenceContext | null {
		const context = this.socketContexts.get(socketId);
		if (!context) {
			return null;
		}

		this.removeParticipantSocket(
			context.roomId,
			context.participantId,
			socketId,
		);

		return context;
	}

	releaseContext(socketId: string, sessionVersion: number): void {
		const currentContext = this.socketContexts.get(socketId);
		if (currentContext?.sessionVersion === sessionVersion) {
			this.socketContexts.delete(socketId);
		}
	}

	/**
	 * Returns the dropped socket ids. Leaving over HTTP does not close them, so
	 * the caller still has to take them out of the room's broadcasts.
	 */
	evict(roomId: string, participantId: string): string[] {
		const socketIds = this.roomParticipants.get(roomId)?.get(participantId);
		if (!socketIds) {
			return [];
		}

		const evicted = Array.from(socketIds);
		for (const socketId of evicted) {
			this.socketContexts.delete(socketId);
		}

		this.dropParticipant(roomId, participantId);

		return evicted;
	}

	private addParticipantSocket(
		roomId: string,
		participantId: string,
		socketId: string,
	) {
		let room = this.roomParticipants.get(roomId);
		if (!room) {
			room = new Map();
			this.roomParticipants.set(roomId, room);
		}

		const socketIds = room.get(participantId);
		if (socketIds) {
			socketIds.add(socketId);
			return;
		}

		room.set(participantId, new Set([socketId]));
	}

	private removeParticipantSocket(
		roomId: string,
		participantId: string,
		socketId: string,
	) {
		const socketIds = this.roomParticipants.get(roomId)?.get(participantId);
		if (!socketIds) {
			return;
		}

		socketIds.delete(socketId);
		if (socketIds.size === 0) {
			this.dropParticipant(roomId, participantId);
		}
	}

	private dropParticipant(roomId: string, participantId: string) {
		const room = this.roomParticipants.get(roomId);
		if (!room) {
			return;
		}

		room.delete(participantId);
		if (room.size === 0) {
			this.roomParticipants.delete(roomId);
		}
	}

	private getNextSessionVersion(socketId: string): number {
		return (this.socketContexts.get(socketId)?.sessionVersion ?? 0) + 1;
	}
}
