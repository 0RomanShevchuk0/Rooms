import { PropsWithChildren } from "react";
import { ChatSocketProvider } from "./ChatSocketProvider";
import { RoomsSocketProvider } from "./RoomsSocketProvider";

export function SocketsProvider({ children }: PropsWithChildren) {
	return (
		<RoomsSocketProvider>
			<ChatSocketProvider>{children}</ChatSocketProvider>
		</RoomsSocketProvider>
	);
}
