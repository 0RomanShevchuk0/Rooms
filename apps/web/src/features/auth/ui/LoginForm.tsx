"use client";
import { useAuth } from "../model/useAuth";
import { AuthForm } from "./AuthForm";

export function LoginForm() {
	const { handleAuth, isLoading, error } = useAuth({ type: "login" });
	return <AuthForm type="login" onSubmit={handleAuth} isLoading={isLoading} error={error} />;
}
