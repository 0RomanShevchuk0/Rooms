import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';

const userIdParamSchema = z.string().uuid();

@Injectable()
export class SelfUserGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>();
		const user = request.user;
		const targetUserId = request.params.id;

		if (!user) {
			throw new UnauthorizedException();
		}

		if (!targetUserId || !userIdParamSchema.safeParse(targetUserId).success) {
			throw new BadRequestException(
				'Validation failed (uuid v4 is expected)',
			);
		}

		if (user.id !== targetUserId) {
			throw new ForbiddenException('You can manage only your own user');
		}

		return true;
	}
}
