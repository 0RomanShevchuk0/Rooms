"use client";
import { useMutation } from "@tanstack/react-query";
import { refreshTokens } from "../api/refresh-tokens";
import { useSession } from "./session.store";
import { useEffect, useState } from "react";
import { mutationKeys } from "@/shared/react-query";

export function useRefreshToken() {
	const [isInitialized, setIsInitialized] = useState(false);
	const { accessToken, setAccessToken } = useSession();

	const refreshTokenMutation = useMutation({
		mutationKey: mutationKeys.session.refreshToken(),
		mutationFn: refreshTokens,
		retry: false,
	});

	useEffect(() => {
		const refreshToken = async () => {
			const data = await refreshTokenMutation.mutateAsync();
			if (data?.access_token) {
				setAccessToken(data.access_token);
			}
			setIsInitialized(true);
		};

		if (!isInitialized && !accessToken) {
			refreshToken();
		}
	}, [refreshTokenMutation, setAccessToken, isInitialized, accessToken]);

	return { isInitialized };
}
