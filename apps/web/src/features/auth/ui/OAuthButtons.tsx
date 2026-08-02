"use client";

import type { ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { FieldSeparator } from "@/shared/ui/field";

import { OAuthProvider } from "../model/types";

function GoogleIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" aria-hidden="true">
			<path
				fill="#4285F4"
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			/>
			<path
				fill="#34A853"
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.03 23 12 23z"
			/>
			<path
				fill="#FBBC05"
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
			/>
			<path
				fill="#EA4335"
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.03 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
			/>
		</svg>
	);
}

function DiscordIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" aria-hidden="true">
			<path
				fill="currentColor"
				d="M20.317 4.369A19.791 19.791 0 0016.885 3c-.227.38-.485.88-.664 1.263-1.976-.297-3.95-.297-5.889 0-.18-.384-.438-.884-.665-1.263A19.736 19.736 0 003.684 4.37C1.75 9.042.94 13.563 1.373 18.03a20.3 20.3 0 006.006 2.98c.45-.62.854-1.27 1.21-1.94-1.9-.57-3.68-1.45-4.9-2.6 0 0 .413-.3 1.134-.92 2.06 1.16 4.22 1.84 6.34 1.84 2.12 0 4.28-.68 6.34-1.84.72.62 1.133.92 1.133.92-1.22 1.15-2.99 2.03-4.9 2.6.356.67.76 1.32 1.21 1.94a20.32 20.32 0 006.006-2.98c.434-4.467-.378-8.988-2.312-13.661zM9.545 15.568c-1.184 0-2.157-1.087-2.157-2.424 0-1.338.951-2.424 2.157-2.424 1.216 0 2.18 1.096 2.157 2.424 0 1.337-.94 2.424-2.157 2.424zm4.91 0c-1.184 0-2.157-1.087-2.157-2.424 0-1.338.951-2.424 2.157-2.424 1.216 0 2.18 1.096 2.157 2.424 0 1.337-.941 2.424-2.157 2.424z"
			/>
		</svg>
	);
}

const OAUTH_PROVIDERS: Record<
	OAuthProvider,
	{
		id: OAuthProvider;
		label: string;
		icon: ReactNode;
	}
> = {
	[OAuthProvider.google]: {
		id: OAuthProvider.google,
		label: "Continue with Google",
		icon: <GoogleIcon className="size-4" />,
	},
	[OAuthProvider.discord]: {
		id: OAuthProvider.discord,
		label: "Continue with Discord",
		icon: <DiscordIcon className="size-4" />,
	},
};

interface OAuthButtonsProps {
	disabled?: boolean;
	onOAuth?: (provider: OAuthProvider) => void;
}

export function OAuthButtons({ disabled, onOAuth }: OAuthButtonsProps) {
	return (
		<div className="grid gap-4">
			<FieldSeparator>Or continue with</FieldSeparator>

			<div className="grid gap-2">
				{Object.values(OAUTH_PROVIDERS).map((provider) => (
					<Button
						key={provider.id}
						type="button"
						variant="outline"
						className="w-full"
						disabled={disabled}
						onClick={() => onOAuth?.(provider.id)}
					>
						{provider.icon}
						{provider.label}
					</Button>
				))}
			</div>
		</div>
	);
}
