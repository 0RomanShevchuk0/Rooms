"use client";
import { useAuth } from "../model/useAuth";
import { startOAuth } from "../model/startOAuth";
import { AuthForm } from "./AuthForm";

export function RegisterForm() {
	const { handleAuth, isLoading, error } = useAuth({ type: "register" });
	return (
		<AuthForm
			type="register"
			onSubmit={handleAuth}
			onOAuth={startOAuth}
			isLoading={isLoading}
			error={error}
		/>
	);
}
