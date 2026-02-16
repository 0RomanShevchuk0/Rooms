"use client";
import { useMutation } from "@tanstack/react-query";
import { AuthCredentials, AuthFormType } from "./types";
import { login, register } from "../api";
import toast from "react-hot-toast";
import axios from "axios";
import { useState } from "react";
import { useSession } from "@/entities/session";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/routes";
import { mutationKeys } from "@/shared/react-query";

interface UseAuthProps {
	type: AuthFormType;
}

export function useAuth({ type }: UseAuthProps) {
	const router = useRouter();
	const { setAccessToken } = useSession();

	const [formError, setFormError] = useState<string | null>(null);

	const mutationFn = type === "login" ? login : register;

	const successMessage = type === "login" ? "Login successful" : "Registration successful";
	const errorMessage = type === "login" ? "Login failed" : "Registration failed";

	const getErrorMessage = (error: unknown): { message: string; isExpected: boolean } => {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			if (status === 401) return { message: "Invalid username or password", isExpected: true };
			if (status === 409) return { message: "Username already exists", isExpected: true };
		}
		return { message: errorMessage, isExpected: false };
	};

	const mutation = useMutation({
		mutationKey: type === "login" ? mutationKeys.auth.login() : mutationKeys.auth.register(),
		mutationFn: async (data: AuthCredentials) => {
			const result = await mutationFn(data);
			if (!result.access_token) {
				throw new Error("No access token returned");
			}
			return result;
		},
		onMutate: () => {
			setFormError(null);
		},
		onSuccess: (data) => {
			setFormError(null);
			setAccessToken(data.access_token);
			toast.success(successMessage);
			router.replace(ROUTES.home);
		},
		onError: (error) => {
			const { message, isExpected } = getErrorMessage(error);
			setFormError(isExpected ? message : null);

			if (!isExpected) {
				toast.error(message);
			}
		},
	});

	const handleAuth = async (data: AuthCredentials) => {
		await mutation.mutateAsync(data);
	};
	return { handleAuth, isLoading: mutation.isPending, error: formError };
}
