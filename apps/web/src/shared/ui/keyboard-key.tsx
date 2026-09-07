import * as React from "react";

import { cn } from "@/shared/lib/utils";

function KeyboardKey({ className, ...props }: React.ComponentProps<"kbd">) {
	return (
		<kbd
			data-slot="keyboard-key"
			className={cn(
				"inline-flex h-5.5 min-w-5.5 items-center justify-center rounded border border-border bg-muted px-1.5 font-sans text-[11px] font-medium text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export { KeyboardKey };
