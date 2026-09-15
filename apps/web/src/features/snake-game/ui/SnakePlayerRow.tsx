import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface SnakePlayerRowProps {
	name: string;
	color?: string;
	isOwn: boolean;
	isDimmed: boolean;
	children: ReactNode;
}

export function SnakePlayerRow({ name, color, isOwn, isDimmed, children }: SnakePlayerRowProps) {
	return (
		<div
			className={cn(
				"grid h-10.5 grid-cols-[4px_1fr_auto] items-center gap-3 border-t border-border/60 pr-3.5",
				isOwn && "bg-primary/5",
				isDimmed && "opacity-55",
			)}
		>
			<span aria-hidden className="self-stretch" style={{ backgroundColor: color }} />

			<span className="flex min-w-0 items-center gap-2 font-medium">
				<span className="truncate">{name}</span>
				{isOwn && (
					<span className="shrink-0 rounded-full bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
						you
					</span>
				)}
			</span>

			{children}
		</div>
	);
}
