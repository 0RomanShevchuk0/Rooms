"use client";
import { RequireGuest } from "@/entities/session";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <RequireGuest>{children}</RequireGuest>;
}
