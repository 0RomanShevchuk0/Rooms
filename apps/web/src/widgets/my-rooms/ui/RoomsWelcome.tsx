import { Button } from "@/shared/ui/button";
import { CreateRoomDialog } from "@/features/create-room";
import { JoinRoomDialog } from "@/features/join-room";

const STEPS = [
	{
		title: "Create a room",
		description: "It comes with its own chat and snake field.",
	},
	{
		title: "Share the invite link",
		description: "Copy it from the room header — anyone who opens it joins.",
	},
	{
		title: "Ready up",
		description: "The match starts once everyone in the room is ready.",
	},
];

export function RoomsWelcome() {
	return (
		<section className="flex flex-col items-center gap-8 py-6 text-center">
			<div className="flex flex-col items-center gap-3">
				<h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
					Create a room. Share the link. Start playing.
				</h1>
				<p className="max-w-xl text-muted-foreground">
					Snake for two or more, with a chat on the side.
				</p>
			</div>

			<ol className="grid w-full gap-4 text-left sm:grid-cols-3">
				{STEPS.map((step, index) => (
					<li key={step.title} className="rounded-xl border border-border/60 bg-card p-5">
						<span className="inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
							{index + 1}
						</span>
						<p className="mt-3 font-medium">{step.title}</p>
						<p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
					</li>
				))}
			</ol>

			<div className="flex flex-wrap justify-center gap-3">
				<CreateRoomDialog>
					<Button size="lg">Create room</Button>
				</CreateRoomDialog>
				<JoinRoomDialog>
					<Button variant="outline" size="lg">
						Join with code
					</Button>
				</JoinRoomDialog>
			</div>
		</section>
	);
}
