import { User } from 'generated/prisma/client';

export type UserForAuth = Pick<User, 'id' | 'username' | 'password'>;
