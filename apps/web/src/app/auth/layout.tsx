"use client";
import { Suspense } from "react";
import { RequireGuest } from "@/entities/session";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<RequireGuest>
			<Suspense fallback={null}>{children}</Suspense>
		</RequireGuest>
	);
}
