import {
	UseFilters,
	UsePipes,
	ValidationPipe,
	applyDecorators,
} from '@nestjs/common';
import { DomainErrorWsFilter } from 'src/shared/errors/domain-error-ws.filter';

export function ApiWsHandler() {
	return applyDecorators(
		UsePipes(
			new ValidationPipe({
				whitelist: true,
				forbidNonWhitelisted: true,
				transform: true,
			}),
		),
		UseFilters(new DomainErrorWsFilter()),
	);
}
