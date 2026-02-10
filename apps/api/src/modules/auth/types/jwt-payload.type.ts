export type JwtPayload = {
	sub: string;
	username: string;
	iat?: number;
	exp?: number;
};
