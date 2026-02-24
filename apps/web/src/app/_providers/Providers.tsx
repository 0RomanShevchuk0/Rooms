"use client";
import type { PropsWithChildren } from "react";
import { QueryProvider } from "./QueryProvider";
import { SessionProvider } from "./SessionProvider";
import { ToasterProvider } from "./ToasterProvider";
import { SocketsProvider } from "./ws";

export function Providers({ children }: PropsWithChildren) {
	return (
		<QueryProvider>
			<SessionProvider>
				<ToasterProvider />
				<SocketsProvider>{children}</SocketsProvider>
			</SessionProvider>
		</QueryProvider>
	);
}
