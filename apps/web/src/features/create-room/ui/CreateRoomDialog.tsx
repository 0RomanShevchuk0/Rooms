"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Field, FieldContent, FieldTitle, FieldError, FieldGroup } from "@/shared/ui/field";
import { createRoom } from "@/entities/room/api";
import { getMe } from "@/entities/user";
import { queryKeys, mutationKeys } from "@/shared/react-query";
import { ROUTES } from "@/shared/routes";

interface CreateRoomForm {
	name: string;
	description?: string;
}

interface CreateRoomDialogProps {
	children: React.ReactNode;
}

export function CreateRoomDialog({ children }: CreateRoomDialogProps) {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();
	const router = useRouter();

	const { data: me } = useQuery({
		queryKey: queryKeys.user.me(),
		queryFn: getMe,
		staleTime: 1000 * 60 * 5,
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setError,
	} = useForm<CreateRoomForm>();

	const createMutation = useMutation({
		mutationKey: mutationKeys.rooms.create(),
		mutationFn: ({ name, description }: CreateRoomForm) =>
			createRoom({
				name,
				description: description || undefined,
				participantIds: [me!.id],
			}),
		onSuccess: (room) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.rooms.my() });
			setOpen(false);
			reset();
			router.push(ROUTES.rooms.room(room.id));
		},
		onError: () => {
			setError("root", { message: "Failed to create room. Try again." });
		},
	});

	const onSubmit = (data: CreateRoomForm) => {
		createMutation.mutate(data);
	};

	const handleOpenChange = (value: boolean) => {
		setOpen(value);
		if (!value) {
			reset();
			createMutation.reset();
		}
	};

	const isDisabled = createMutation.isPending || !me;

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Create a room</AlertDialogTitle>
					<AlertDialogDescription>
						{"Set up your room. You'll be added as a player automatically."}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
					<FieldGroup className="gap-3">
						<Field>
							<FieldContent>
								<FieldTitle>
									<label htmlFor="name">Name</label>
								</FieldTitle>
								<Input
									id="name"
									placeholder="My awesome room"
									autoFocus
									disabled={isDisabled}
									{...register("name", { required: "Name is required" })}
								/>
								<FieldError errors={[errors.name]} />
							</FieldContent>
						</Field>

						<Field>
							<FieldContent>
								<FieldTitle>
									<label htmlFor="description">Description</label>
								</FieldTitle>
								<Textarea
									id="description"
									placeholder="Optional description..."
									rows={3}
									disabled={isDisabled}
									{...register("description")}
								/>
							</FieldContent>
						</Field>
					</FieldGroup>

					{errors.root && (
						<p role="alert" className="text-sm text-destructive">
							{errors.root.message}
						</p>
					)}

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDisabled}>Cancel</AlertDialogCancel>
						<Button type="submit" disabled={isDisabled}>
							{createMutation.isPending ? "Creating..." : "Create room"}
						</Button>
					</AlertDialogFooter>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
