"use client";
import { Gamepad2 } from "lucide-react";
import { MyRooms } from "@/widgets/my-rooms";
import { UserMenu } from "@/widgets/user-menu";

export default function Page() {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10">
				<header className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-2xl border border-border bg-primary/10 text-primary">
							<Gamepad2 className="size-5" />
						</div>
						<div>
							<p className="text-sm font-semibold">Rooms</p>
							<p className="text-xs text-muted-foreground">Real-time rooms</p>
						</div>
					</div>
					<UserMenu />
				</header>

				<MyRooms />
			</div>
		</main>
	);
}
