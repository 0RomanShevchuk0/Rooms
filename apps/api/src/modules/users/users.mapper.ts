import type {
	PublicUser as RestPublicUser,
	User as RestUser,
} from '@rooms/contracts/user';
import type { PublicUser, UserRecord } from './users.select';

/** Only for the owner of the account — carries the email. */
export function toRestUser(user: UserRecord): RestUser {
	return {
		id: user.id,
		username: user.username,
		email: user.email,
		name: user.name,
		deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
	};
}

export function toPublicRestUser(user: PublicUser): RestPublicUser {
	return {
		id: user.id,
		username: user.username,
		name: user.name,
	};
}
