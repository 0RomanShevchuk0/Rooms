"use client";
import { useAuth } from "../model/useAuth";
import { startOAuth } from "../model/startOAuth";
import { AuthForm } from "./AuthForm";

export function LoginForm() {
	const { handleAuth, isLoading, error } = useAuth({ type: "login" });
	return (
		<AuthForm
			type="login"
			onSubmit={handleAuth}
			onOAuth={startOAuth}
			isLoading={isLoading}
			error={error}
		/>
	);
}
