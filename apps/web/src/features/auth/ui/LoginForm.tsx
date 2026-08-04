"use client";
import { useAuth } from "../model/useAuth";
import { useOAuthError } from "../model/useOAuthError";
import { startOAuth } from "../model/startOAuth";
import { AuthForm } from "./AuthForm";

export function LoginForm() {
	const { handleAuth, isLoading, error } = useAuth({ type: "login" });
	const oauthError = useOAuthError();

	return (
		<AuthForm
			type="login"
			onSubmit={handleAuth}
			onOAuth={startOAuth}
			isLoading={isLoading}
			error={error ?? oauthError}
		/>
	);
}
