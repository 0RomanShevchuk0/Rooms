import { ArrowLeft, RotateCw } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";
import { ROUTES } from "../routes";

type ErrorScreenProps = {
	title?: string;
	description?: string;
	onRetry?: () => void;
	isRetrying?: boolean;
	backHref?: string;
	backLabel?: string;
};

export function ErrorScreen({
	title = "Something went wrong",
	description = "Could not load this page. Check your connection and try again.",
	onRetry,
	isRetrying = false,
	backHref = ROUTES.home,
	backLabel = "Back to home",
}: ErrorScreenProps) {
	return (
		<div className="flex h-screen w-full flex-col items-center justify-center gap-4 px-6 text-center">
			<h1 className="text-2xl font-semibold">{title}</h1>
			<p className="max-w-md text-muted-foreground">{description}</p>
			<div className="flex flex-wrap items-center justify-center gap-2">
				{onRetry && (
					<Button onClick={onRetry} disabled={isRetrying}>
						<RotateCw className={isRetrying ? "size-4 animate-spin" : "size-4"} />
						{isRetrying ? "Retrying..." : "Try again"}
					</Button>
				)}
				<Button variant="outline" asChild>
					<Link href={backHref}>
						<ArrowLeft className="size-4" />
						{backLabel}
					</Link>
				</Button>
			</div>
		</div>
	);
}
