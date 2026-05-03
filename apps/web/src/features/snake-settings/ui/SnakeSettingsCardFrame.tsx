import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface SnakeSettingsCardFrameProps {
	title: string;
	description: string;
	children: ReactNode;
}

export function SnakeSettingsCardFrame({
	title,
	description,
	children,
}: SnakeSettingsCardFrameProps) {
	return (
		<Card className="border-border/60">
			<CardHeader className="space-y-3">
				<CardTitle>{title}</CardTitle>
				<p className="text-xs text-muted-foreground">{description}</p>
			</CardHeader>
			<CardContent className="grid gap-3 text-xs text-muted-foreground">{children}</CardContent>
		</Card>
	);
}
