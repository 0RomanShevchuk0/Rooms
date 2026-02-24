"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";

import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Field, FieldContent, FieldTitle, FieldError } from "@/shared/ui/field";
import { roomApi } from "@/entities/room/api";
import { queryKeys, mutationKeys } from "@/shared/react-query";
import { ROUTES } from "@/shared/routes";

interface JoinRoomForm {
	roomId: string;
}

interface JoinRoomDialogProps {
	children: React.ReactNode;
}

export function JoinRoomDialog({ children }: JoinRoomDialogProps) {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setError,
	} = useForm<JoinRoomForm>();

	const joinMutation = useMutation({
		mutationKey: mutationKeys.rooms.join(),
		mutationFn: (roomId: string) => roomApi.joinRoom(roomId),
		onSuccess: (_, roomId) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.rooms.my() });
			setOpen(false);
			reset();
			router.push(ROUTES.rooms.room(roomId));
		},
		onError: (error) => {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				setError("roomId", { message: "Room not found" });
			} else {
				setError("roomId", { message: "Something went wrong. Try again." });
			}
		},
	});

	const onSubmit = ({ roomId }: JoinRoomForm) => {
		joinMutation.mutate(roomId.trim());
	};

	const handleOpenChange = (value: boolean) => {
		setOpen(value);
		if (!value) {
			reset();
			joinMutation.reset();
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogTitle>Join a room</AlertDialogTitle>
					<AlertDialogDescription>
						Enter the room ID shared with you to join.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
					<Field>
						<FieldContent>
							<FieldTitle>
								<label htmlFor="roomId">Room ID</label>
							</FieldTitle>
							<Input
								id="roomId"
								placeholder="e.g. cm9xabc123..."
								autoFocus
								disabled={joinMutation.isPending}
								{...register("roomId", { required: "Room ID is required" })}
							/>
							<FieldError errors={[errors.roomId]} />
						</FieldContent>
					</Field>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={joinMutation.isPending}>
							Cancel
						</AlertDialogCancel>
						<Button type="submit" disabled={joinMutation.isPending}>
							{joinMutation.isPending ? "Joining..." : "Join room"}
						</Button>
					</AlertDialogFooter>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
