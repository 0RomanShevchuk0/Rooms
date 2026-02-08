import * as React from "react";

import { cn } from "@/shared/lib/utils";
import { Loader } from "lucide-react";

type SpinnerProps = {
	className?: string;
	size?: number;
	"aria-label"?: string;
};

function SpinnerLoader({ className, size = 24, "aria-label": ariaLabel = "Loading" }: SpinnerProps) {
	return (
		<Loader
			aria-label={ariaLabel}
			role="status"
			size={size}
			className={cn("animate-spin text-muted-foreground", className)}
		/>
	);
}

function FullWidthSpinnerLoader({ className, size = 24, "aria-label": ariaLabel = "Loading" }: SpinnerProps) {
	return (
		<div className="flex w-full items-center justify-center">
			<Loader
				aria-label={ariaLabel}
				role="status"
				size={size}
				className={cn("animate-spin text-muted-foreground", className)}
			/>
		</div>
	);
}

type FullscreenSpinnerProps = SpinnerProps & {
	containerClassName?: string;
};

function FullscreenSpinnerLoader({ containerClassName, ...props }: FullscreenSpinnerProps) {
	return (
		<div className={cn("flex h-screen items-center justify-center", containerClassName)}>
			<SpinnerLoader {...props} />
		</div>
	);
}

export { SpinnerLoader, FullWidthSpinnerLoader, FullscreenSpinnerLoader };
