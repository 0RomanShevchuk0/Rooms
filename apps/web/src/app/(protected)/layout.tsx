"use client";
import { RequireAuth } from "@/entities/session";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <RequireAuth>{children}</RequireAuth>;
}
