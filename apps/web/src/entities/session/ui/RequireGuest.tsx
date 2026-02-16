"use client";
import { PropsWithChildren, useEffect } from "react";
import { useSession } from "../model/session.store";
import { useRouter } from "next/navigation";

export function RequireGuest({ children }: PropsWithChildren) {
	const router = useRouter();
	const { accessToken } = useSession();
	console.log("🚀 ~ RequireGuest ~ accessToken:", accessToken);

	useEffect(() => {
		if (accessToken) {
			router.push("/");
		}
	}, [accessToken, router]);

	return !accessToken ? children : null;
}
