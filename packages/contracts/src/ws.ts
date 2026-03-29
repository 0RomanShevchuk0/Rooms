import { z } from "zod";

export const DomainWsErrorResponseSchema = z.object({
	error: z.string(),
	code: z.string().optional(),
});

export const NestWsErrorResponseSchema = z.object({
	status: z.literal("error"),
	message: z.string(),
	cause: z.unknown().optional(),
});

export const WsErrorResponseSchema = z.union([
	DomainWsErrorResponseSchema,
	NestWsErrorResponseSchema,
]);

export type DomainWsErrorResponse = z.infer<typeof DomainWsErrorResponseSchema>;
export type NestWsErrorResponse = z.infer<typeof NestWsErrorResponseSchema>;
export type WsErrorResponse = z.infer<typeof WsErrorResponseSchema>;
