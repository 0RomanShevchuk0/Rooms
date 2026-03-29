"use client";
import { useMutation } from "@tanstack/react-query";
import { refreshTokens } from "../api/refresh-tokens";
import { useSession } from "./session.store";
import { useEffect, useRef, useState } from "react";
import { mutationKeys } from "@/shared/react-query";

export function useRefreshToken() {
	const [isInitialized, setIsInitialized] = useState(false);
	const refreshStartedRef = useRef(false);
	const { accessToken, setAccessToken } = useSession();

	const refreshTokenMutation = useMutation({
		mutationKey: mutationKeys.session.refreshToken(),
		mutationFn: refreshTokens,
		retry: false,
	});

	useEffect(() => {
		if (isInitialized) {
			return;
		}

		if (accessToken) {
			setIsInitialized(true);
			return;
		}

		if (refreshStartedRef.current) {
			return;
		}
		refreshStartedRef.current = true;

		const refreshToken = async () => {
			try {
				const data = await refreshTokenMutation.mutateAsync();
				if ("access_token" in data && data.access_token) {
					setAccessToken(data.access_token);
				}
			} finally {
				setIsInitialized(true);
			}
		};

		refreshToken();
	}, [refreshTokenMutation, setAccessToken, accessToken, isInitialized]);

	return { isInitialized };
}
