export type AuthFormType = "login" | "register";

export type AuthCredentials = {
	username: string;
	password: string;
};

export type AuthTokenResponse = {
	access_token: string;
};
