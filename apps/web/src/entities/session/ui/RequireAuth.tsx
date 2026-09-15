"use client";
import { PropsWithChildren, useEffect } from "react";
import { useSession } from "../model/session.store";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/routes";
import { FullscreenSpinnerLoader } from "@/shared/ui/spinner-loader";
import { getCurrentNextPath, sanitizeNextPath, withNextPath } from "@/shared/lib/next-path";

export function RequireAuth({ children }: PropsWithChildren) {
	const router = useRouter();
	const { accessToken, isInitialized } = useSession();

	useEffect(() => {
		if (!isInitialized || accessToken) return;

		// Read off `window` rather than `useSearchParams`, so wrapping a page in
		// this guard never drags it out of static prerendering.
		const currentPath = sanitizeNextPath(getCurrentNextPath());
		const nextPath = currentPath === ROUTES.home ? null : currentPath;

		router.replace(withNextPath(ROUTES.auth.login, nextPath));
	}, [accessToken, isInitialized, router]);

	if (!isInitialized) return <FullscreenSpinnerLoader />;

	return accessToken ? children : null;
}
