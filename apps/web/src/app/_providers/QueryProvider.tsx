"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { useState } from "react";

export function QueryProvider({ children }: PropsWithChildren) {
	const [queryClient] = useState(() => new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			}
		}
	}));
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
