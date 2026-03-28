import { Injectable, PipeTransform } from '@nestjs/common';
import { z, type ZodTypeAny } from 'zod';
import { DomainError } from '../errors/domain.error';

@Injectable()
export class ZodValidationPipe<
	TSchema extends ZodTypeAny,
> implements PipeTransform<unknown, z.infer<TSchema>> {
	constructor(private readonly schema: TSchema) {}

	transform(value: unknown): z.infer<TSchema> {
		const parsed = this.schema.safeParse(value);
		if (!parsed.success) {
			throw DomainError.validation('Validation failed', {
				issues: parsed.error.issues.map((issue) => ({
					path: issue.path.join('.'),
					message: issue.message,
					code: issue.code,
				})),
			});
		}

		return parsed.data;
	}
}
