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

interface SnakeGameOverDialogProps {
	open: boolean;
	finalSnakeLength: number;
	onClose: () => void;
	onPlayAgain: () => void;
}

export function SnakeGameOverDialog({
	open,
	finalSnakeLength,
	onClose,
	onPlayAgain,
}: SnakeGameOverDialogProps) {
	return (
		<AlertDialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) onClose();
			}}
		>
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogTitle>Game over</AlertDialogTitle>
					<AlertDialogDescription>Final snake length: {finalSnakeLength}.</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
					<AlertDialogAction onClick={onPlayAgain}>Play again</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
