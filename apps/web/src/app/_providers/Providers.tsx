import type { PropsWithChildren } from "react";
import { QueryProvider } from "./QueryProvider";
import { SocketProvider } from "./SocketProvider";
import { ToasterProvider } from "./ToasterProvider";

export function Providers({ children }: PropsWithChildren) {
	return (
		<QueryProvider>
			<ToasterProvider />
			<SocketProvider>{children}</SocketProvider>
		</QueryProvider>
	);
}
