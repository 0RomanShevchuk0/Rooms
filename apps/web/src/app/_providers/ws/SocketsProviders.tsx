import { PropsWithChildren } from "react";
import { RoomsSocketProvider } from "./RoomsSocketProvider";

export function SocketsProvider({ children }: PropsWithChildren) {
	return <RoomsSocketProvider>{children}</RoomsSocketProvider>;
}
