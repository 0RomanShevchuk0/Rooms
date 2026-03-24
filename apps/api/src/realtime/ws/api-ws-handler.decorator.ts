import {
	UseFilters,
	UsePipes,
	ValidationPipe,
	applyDecorators,
} from '@nestjs/common';
import { DomainErrorFilter } from 'src/shared/errors/domain-error.filter';

export function ApiWsHandler() {
	return applyDecorators(
		UsePipes(
			new ValidationPipe({
				whitelist: true,
				forbidNonWhitelisted: true,
				transform: true,
			}),
		),
		UseFilters(new DomainErrorFilter()),
	);
}
