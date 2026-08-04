import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	Injectable,
	Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { OAUTH_ERROR_CODES, type OAuthErrorCode } from '@rooms/contracts/auth';
import {
	DOMAIN_ERROR_CODES,
	isDomainError,
} from 'src/shared/errors/domain.error';
import { isOAuthCallbackError } from './oauth-callback.error';

const LOGIN_PATH = '/auth/login';

/**
 * OAuth callbacks are top-level browser navigations, so failures have to come
 * back as a redirect to the login page instead of a JSON error body.
 */
@Injectable()
@Catch()
export class OAuthCallbackErrorFilter implements ExceptionFilter {
	private readonly logger = new Logger(OAuthCallbackErrorFilter.name);

	constructor(private readonly configService: ConfigService) {}

	catch(exception: unknown, host: ArgumentsHost) {
		const response = host.switchToHttp().getResponse<Response>();
		const code = resolveErrorCode(exception);

		this.logger.warn(
			`OAuth callback failed with "${code}": ${describe(exception)}`,
		);

		const clientUrl = this.configService
			.getOrThrow<string>('CLIENT_URL')
			.replace(/\/$/, '');

		response.redirect(`${clientUrl}${LOGIN_PATH}?error=${code}`);
	}
}

function resolveErrorCode(exception: unknown): OAuthErrorCode {
	if (isOAuthCallbackError(exception)) {
		return exception.code;
	}

	if (
		isDomainError(exception) &&
		exception.code === DOMAIN_ERROR_CODES.CONFLICT
	) {
		return OAUTH_ERROR_CODES.accountExists;
	}

	return OAUTH_ERROR_CODES.failed;
}

function describe(exception: unknown): string {
	return exception instanceof Error
		? (exception.stack ?? exception.message)
		: String(exception);
}
