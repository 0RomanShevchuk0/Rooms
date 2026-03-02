"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogTrigger,
	AlertDialogAction,
} from "@/shared/ui/alert-dialog";
import { leaveRoom } from "@/entities/room/api";
import { queryKeys, mutationKeys } from "@/shared/react-query";
import { ROUTES } from "@/shared/routes";

interface LeaveRoomDialogProps {
	roomId: string;
	children: React.ReactNode;
}

export function LeaveRoomDialog({ roomId, children }: LeaveRoomDialogProps) {
	const queryClient = useQueryClient();
	const router = useRouter();

	const leaveMutation = useMutation({
		mutationKey: mutationKeys.rooms.leave(),
		mutationFn: () => leaveRoom(roomId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.rooms.my() });
			router.push(ROUTES.home);
		},
	});

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogTitle>Leave room?</AlertDialogTitle>
					<AlertDialogDescription>
						{"You'll be removed from the room permanently. You can rejoin later with the room ID."}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction variant="destructive" onClick={() => leaveMutation.mutate()}>
						Leave room
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
