"use client";
import Link from "next/link";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { RoomsList } from "@/widgets/rooms-list";

export default function Page() {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12">
				<header className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-2xl border border-border bg-primary/10" />
						<div>
							<p className="text-sm font-semibold">Rooms</p>
							<p className="text-xs text-muted-foreground">Real-time rooms</p>
						</div>
					</div>
				</header>

				<section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
					<div className="flex flex-col gap-4">
						<h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
							Create a room. Share a link. Start playing.
						</h1>
						<p className="max-w-xl text-base text-muted-foreground">
							Minimal, fast, and focused on real-time play.
						</p>
						<div className="flex flex-wrap gap-3">
							<Button asChild>
								<Link href="/room">Create room</Link>
							</Button>
							<Button variant="outline" asChild>
								<Link href="/room">Join with code</Link>
							</Button>
						</div>
					</div>

					<Card className="h-fit border-border/60 lg:sticky lg:top-8">
						<CardHeader className="space-y-2">
							<div className="flex items-center justify-between gap-3">
								<CardTitle className="text-base">Quick start</CardTitle>
								<Badge variant="outline">Realtime</Badge>
							</div>
							<CardDescription>Everything you need to jump in.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div className="flex gap-3">
								<span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-primary/10 text-xs font-semibold">
									1
								</span>
								<p>
									Click <span className="font-medium">Create room</span> to get a link.
								</p>
							</div>
							<div className="flex gap-3">
								<span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-primary/10 text-xs font-semibold">
									2
								</span>
								<p>Share it with a friend and join together.</p>
							</div>
							<div className="flex gap-3">
								<span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-primary/10 text-xs font-semibold">
									3
								</span>
								<p>When both players are ready, the game starts.</p>
							</div>
						</CardContent>
					</Card>
				</section>

				<RoomsList />
			</div>
		</main>
	);
}
