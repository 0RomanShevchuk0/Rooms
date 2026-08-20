import { OAuthProvider } from 'generated/prisma/enums';

export interface CreateUserInput {
	username: string;
	password: string;
}

export interface CreateOauthUserInput {
	provider: OAuthProvider;
	oauthId: string;
	email?: string;
	name?: string;
}
