import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class PasswordsService {
	async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 10);
	}

	async validatePassword(
		password: string,
		passwordHash: string,
	): Promise<boolean> {
		return await bcrypt.compare(password, passwordHash);
	}
}
