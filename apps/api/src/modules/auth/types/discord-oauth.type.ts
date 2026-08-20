/** Subset of the Discord API responses that the OAuth flow actually consumes. */

export interface DiscordTokenResponse {
	token_type: string;
	access_token: string;
	expires_in: number;
	scope: string;
}

export interface DiscordUser {
	id: string;
	username: string;
	global_name: string | null;
	email?: string | null;
	verified?: boolean;
}
