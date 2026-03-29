"use client";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldTitle } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/shared/ui/input-group";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import type { AuthCredentials } from "@rooms/contracts/auth";

import type { AuthFormType } from "../model/types";
import { ROUTES } from "@/shared/routes";

const AUTH_FORM_CONTENT: Record<
	AuthFormType,
	{
		title: string;
		description?: string;
		submitLabel: string;
		passwordAutocomplete: "current-password" | "new-password";
		switchText: string;
		switchHref: string;
		switchLinkLabel: string;
	}
> = {
	login: {
		title: "Sign in",
		description: "Welcome back. Enter your credentials to continue.",
		submitLabel: "Sign in",
		passwordAutocomplete: "current-password",
		switchText: "Don't have an account?",
		switchHref: ROUTES.auth.register,
		switchLinkLabel: "Create one",
	},
	register: {
		title: "Create account",
		submitLabel: "Create account",
		passwordAutocomplete: "new-password",
		switchText: "Already have an account?",
		switchHref: ROUTES.auth.login,
		switchLinkLabel: "Sign in",
	},
};

interface AuthFormProps {
	type?: AuthFormType;
	onSubmit?: (data: AuthCredentials) => void | Promise<void>;
	isLoading?: boolean;
	error?: React.ReactNode;
}

export function AuthForm({ type = "login", onSubmit, isLoading, error }: AuthFormProps) {
	const formId = useId();
	const usernameId = `${formId}-username`;
	const passwordId = `${formId}-password`;

	const [isPasswordVisible, setIsPasswordVisible] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<AuthCredentials>();

	const content = AUTH_FORM_CONTENT[type];
	const isDisabled = (isLoading ?? false) || isSubmitting;

	const handleFormSubmit: SubmitHandler<AuthCredentials> = async (data) => {
		await onSubmit?.(data);
	};

	return (
		<div className="mx-auto flex min-h-svh w-full max-w-105 flex-col justify-center px-4 py-10">
			<Card>
				<CardHeader className="border-b">
					<CardTitle>{content.title}</CardTitle>
					{content.description ? <CardDescription>{content.description}</CardDescription> : null}
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-6">
						<FieldGroup className="gap-4">
							<Field>
								<FieldContent>
									<FieldTitle>
										<label htmlFor={usernameId}>Username</label>
									</FieldTitle>
									<Input
										id={usernameId}
										autoComplete="username"
										aria-invalid={!!errors.username}
										aria-describedby={errors.username ? `${usernameId}-error` : undefined}
										disabled={isDisabled}
										{...register("username", {
											required: "Username is required",
										})}
									/>
									<FieldError id={`${usernameId}-error`} errors={[errors.username]} />
								</FieldContent>
							</Field>

							<Field>
								<FieldContent>
									<FieldTitle>
										<label htmlFor={passwordId}>Password</label>
									</FieldTitle>

									<InputGroup>
										<InputGroupInput
											id={passwordId}
											type={isPasswordVisible ? "text" : "password"}
											autoComplete={content.passwordAutocomplete}
											aria-invalid={!!errors.password}
											aria-describedby={errors.password ? `${passwordId}-error` : undefined}
											disabled={isDisabled}
											{...register("password", {
												required: "Password is required",
											})}
										/>
										<InputGroupAddon align="inline-end">
											<InputGroupButton
												aria-label={isPasswordVisible ? "Hide password" : "Show password"}
												onClick={() => setIsPasswordVisible((v) => !v)}
												disabled={isDisabled}
											>
												{isPasswordVisible ? <EyeOff /> : <Eye />}
											</InputGroupButton>
										</InputGroupAddon>
									</InputGroup>

									<FieldError id={`${passwordId}-error`} errors={[errors.password]} />
								</FieldContent>
							</Field>
						</FieldGroup>

						<div className="grid gap-2">
							<Button type="submit" className="w-full" disabled={isDisabled}>
								{content.submitLabel}
							</Button>

							<div
								aria-live="polite"
								className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${
									error ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
								}`}
							>
								{error ? (
									<div role="alert" className="text-destructive text-sm">
										{error}
									</div>
								) : null}
							</div>
						</div>

						<p className="text-muted-foreground text-sm text-center">
							{content.switchText}{" "}
							<Link
								href={content.switchHref}
								className="text-primary font-medium underline underline-offset-4 hover:opacity-80"
							>
								{content.switchLinkLabel}
							</Link>
						</p>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
