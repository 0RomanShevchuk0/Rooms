"use client";
import { useAuth } from "../model/useAuth";
import { AuthForm } from "./AuthForm";

export function RegisterForm() {
	const { handleAuth, isLoading, error } = useAuth({ type: "register" });
	return <AuthForm type="register" onSubmit={handleAuth} isLoading={isLoading} error={error} />;
}
