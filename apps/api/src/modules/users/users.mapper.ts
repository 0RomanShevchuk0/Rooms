import type { User as RestUser } from '@rooms/contracts/user';
import type { PublicUser } from './users.select';

export function toRestUser(user: PublicUser): RestUser {
	return {
		id: user.id,
		username: user.username,
		email: user.email,
		name: user.name,
		deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
	};
}
