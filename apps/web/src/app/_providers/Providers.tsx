import type { PropsWithChildren } from "react";
import { QueryProvider } from "./QueryProvider";
import { SocketProvider } from "./SocketProvider";

export function Providers({ children }: PropsWithChildren) {
	return (
		<QueryProvider>
			<SocketProvider>{children}</SocketProvider>
		</QueryProvider>
	);
}
