import { UseFilters, applyDecorators } from '@nestjs/common';
import { DomainErrorWsFilter } from 'src/shared/errors/domain-error-ws.filter';

export function ApiWsHandler() {
	return applyDecorators(UseFilters(new DomainErrorWsFilter()));
}
