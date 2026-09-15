"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import type { SnakeMatchResult } from "../model/matchResults";
import { SnakePlayerRow } from "./SnakePlayerRow";

interface SnakeGameOverDialogProps {
	open: boolean;
	results: SnakeMatchResult[];
	onClose: () => void;
	onPlayAgain: () => void;
}

export function SnakeGameOverDialog({
	open,
	results,
	onClose,
	onPlayAgain,
}: SnakeGameOverDialogProps) {
	const ownResult = results.find((result) => result.isOwn);

	return (
		<AlertDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Game over</AlertDialogTitle>
					<AlertDialogDescription>
						{ownResult
							? ownResult.alive
								? `You survived with length ${ownResult.length}.`
								: `You finished with length ${ownResult.length}.`
							: "The match has ended."}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="overflow-hidden rounded-xl border border-border/60 bg-card text-left">
					{results.map((result) => (
						<SnakePlayerRow
							key={result.participantId}
							name={result.name}
							color={result.color}
							isOwn={result.isOwn}
							isDimmed={!result.alive}
						>
							<span className="flex items-baseline gap-2">
								{!result.alive && (
									<span className="text-[13px] text-muted-foreground">out</span>
								)}
								<span className="min-w-[2ch] text-right text-base font-semibold tabular-nums">
									{result.length}
								</span>
							</span>
						</SnakePlayerRow>
					))}
				</div>

				<AlertDialogFooter>
					<AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
					<AlertDialogAction onClick={onPlayAgain}>Play again</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
