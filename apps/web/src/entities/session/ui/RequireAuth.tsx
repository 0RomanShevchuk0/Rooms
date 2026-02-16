"use client";
import { PropsWithChildren, useEffect } from "react";
import { useSession } from "../model/session.store";
import { useRouter } from "next/navigation";

export function RequireAuth({ children }: PropsWithChildren) {
	const router = useRouter();
	const { accessToken } = useSession();

	useEffect(() => {
		if (!accessToken) {
			router.push("/auth/login");
		}
	}, [accessToken, router]);

	return accessToken ? children : null;
}
