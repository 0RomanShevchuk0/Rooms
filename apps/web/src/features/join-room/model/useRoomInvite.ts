"use client";

import { useEffect } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { joinRoom } from "@/entities/room/api";
import { mutationKeys, queryKeys } from "@/shared/react-query";
import { ROUTES } from "@/shared/routes";
import { INVITE_PARAM, isInviteForRoom } from "@/shared/lib/room-invite";

interface UseRoomInviteProps {
	roomId: string;
	/** Error from the room query; a 403 means "exists, but you are not in it yet". */
	roomError: unknown;
	hasRoomAccess: boolean;
}

function isAccessDenied(error: unknown): boolean {
	return axios.isAxiosError(error) && error.response?.status === 403;
}

/**
 * Joins the room when an invite link is opened by a non-participant. A plain
 * room URL grants nothing: without the param a non-participant keeps the 403
 * and lands on the not-found screen.
 */
export function useRoomInvite({ roomId, roomError, hasRoomAccess }: UseRoomInviteProps) {
	const queryClient = useQueryClient();
	const searchParams = useSearchParams();

	const isInvite = isInviteForRoom(searchParams.get(INVITE_PARAM), roomId);

	const { mutate, status } = useMutation({
		mutationKey: mutationKeys.rooms.join(),
		mutationFn: () => joinRoom(roomId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.rooms.byId(roomId) });
			queryClient.invalidateQueries({ queryKey: queryKeys.rooms.meRoomParticipant(roomId) });
			queryClient.invalidateQueries({ queryKey: queryKeys.rooms.my() });
			toast.success("You joined the room");
		},
	});

	const shouldJoin = isInvite && isAccessDenied(roomError);

	useEffect(() => {
		if (!shouldJoin || status !== "idle") return;

		mutate();
	}, [shouldJoin, status, mutate]);

	useEffect(() => {
		if (!isInvite || !hasRoomAccess) return;

		// Once the person is in, the invite has done its job — drop it from the
		// address bar so a reload or a re-share carries a plain room URL.
		// `history` rather than `router`, to avoid a navigation round trip.
		window.history.replaceState(null, "", ROUTES.rooms.room(roomId));
	}, [isInvite, hasRoomAccess, roomId]);

	return {
		// Stays true through the refetch that follows the join, so the page does
		// not flash "not found" between the two requests.
		isJoining: shouldJoin && status !== "error",
	};
}
