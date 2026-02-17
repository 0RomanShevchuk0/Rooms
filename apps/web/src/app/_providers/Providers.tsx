"use client";
import type { PropsWithChildren } from "react";
import { QueryProvider } from "./QueryProvider";
import { SessionProvider } from "./SessionProvider";
import { SocketProvider } from "./SocketProvider";
import { ToasterProvider } from "./ToasterProvider";

export function Providers({ children }: PropsWithChildren) {
	return (
		<QueryProvider>
			<SessionProvider>
				<ToasterProvider />
				<SocketProvider>{children}</SocketProvider>
			</SessionProvider>
		</QueryProvider>
	);
}
