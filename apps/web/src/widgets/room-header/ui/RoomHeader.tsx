"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/shared/routes";
import { CopyInviteLinkButton } from "@/features/invite-room";
import { RoomMenu } from "./RoomMenu";

interface RoomHeaderProps {
	roomId: string;
	roomName: string;
	roomDescription: string | null;
}

export function RoomHeader({ roomId, roomName, roomDescription }: RoomHeaderProps) {
	return (
		<header className="flex flex-wrap items-center justify-between gap-4">
			<div className="min-w-0">
				<h1 className="text-2xl font-semibold">{roomName}</h1>
				{roomDescription ? (
					<p className="mt-1 line-clamp-2 max-w-prose text-sm text-muted-foreground">
						{roomDescription}
					</p>
				) : null}
			</div>
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
					<Link href={ROUTES.home}>
						<ArrowLeft className="size-4" />
						Back
					</Link>
				</Button>
				<CopyInviteLinkButton roomId={roomId} />
				<RoomMenu roomId={roomId} />
			</div>
		</header>
	);
}
