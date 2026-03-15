import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";
import { ROUTES } from "../routes";

type NotFoundScreenProps = {
	title?: string;
	description?: string;
	backHref?: string;
	backLabel?: string;
};

export function NotFoundScreen({
	title = "404",
	description = "Not found",
	backHref = ROUTES.home,
	backLabel = "Back to home",
}: NotFoundScreenProps) {
	return (
		<div className="flex h-screen w-full flex-col items-center justify-center gap-4">
			<h1 className="text-4xl font-bold">{title}</h1>
			<p className="text-muted-foreground">{description}</p>
			<Button variant="outline" asChild>
				<Link href={backHref}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					{backLabel}
				</Link>
			</Button>
		</div>
	);
}
