"use client";
import { PropsWithChildren, useEffect } from "react";
import { useSession } from "../model/session.store";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/routes";

export function RequireGuest({ children }: PropsWithChildren) {
	const router = useRouter();
	const { accessToken } = useSession();

	useEffect(() => {
		if (accessToken) {
			router.push(ROUTES.home);
		}
	}, [accessToken, router]);

	return !accessToken ? children : null;
}
