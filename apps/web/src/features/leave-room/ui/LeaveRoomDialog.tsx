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
	/** Omit to drive the dialog through `open` instead of a trigger element. */
	children?: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function LeaveRoomDialog({ roomId, children, open, onOpenChange }: LeaveRoomDialogProps) {
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
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			{children ? <AlertDialogTrigger asChild>{children}</AlertDialogTrigger> : null}
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogTitle>Leave room?</AlertDialogTitle>
					<AlertDialogDescription>
						{
							"You'll be removed from the room permanently. You can rejoin later with the room ID."
						}
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
