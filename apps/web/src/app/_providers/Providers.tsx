"use client";
import type { PropsWithChildren } from "react";
import { QueryProvider } from "./QueryProvider";
import { SessionProvider } from "./SessionProvider";
import { ToasterProvider } from "./ToasterProvider";
import { useSocketsConnect } from "@/shared/lib/realtime";

export function Providers({ children }: PropsWithChildren) {
	useSocketsConnect();

	return (
		<QueryProvider>
			<SessionProvider>
				<ToasterProvider />
				{children}
			</SessionProvider>
		</QueryProvider>
	);
}
