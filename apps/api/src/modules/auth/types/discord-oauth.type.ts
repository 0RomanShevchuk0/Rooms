export interface DiscordTokenResponse {
	token_type: string;
	access_token: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

export interface DiscordUser {
	id: string;
	username: string;
	discriminator: string;
	global_name: string | null;

	avatar: string | null;
	banner: string | null;
	banner_color: string | null;
	accent_color: number | null;

	avatar_decoration_data: unknown;
	collectibles: unknown;
	display_name_styles: unknown;
	clan: unknown;
	primary_guild: unknown;

	public_flags: number;
	flags: number;
	premium_type: number;

	locale: string;
	mfa_enabled: boolean;

	email?: string;
	verified?: boolean;
}
