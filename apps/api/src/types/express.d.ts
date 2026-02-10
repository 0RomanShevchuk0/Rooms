import { AuthUser } from '../modules/auth/types/auth-user.type';

declare global {
	namespace Express {
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		interface User extends AuthUser {}
	}
}

export {};
