"use client";
import { useMutation } from "@tanstack/react-query";
import { refreshTokens } from "../api/refresh-tokens";
import { useSession } from "./session.store";
import { useEffect, useRef } from "react";
import { mutationKeys } from "@/shared/react-query";

export function useRefreshToken() {
	const refreshStartedRef = useRef(false);
	const { accessToken, isInitialized, setAccessToken, markInitialized } = useSession();

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
			markInitialized();
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
				markInitialized();
			}
		};

		refreshToken();
	}, [refreshTokenMutation, setAccessToken, markInitialized, accessToken, isInitialized]);
}
