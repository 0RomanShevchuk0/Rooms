import {
	WsErrorResponseSchema,
	type DomainWsValidationIssue,
	type WsErrorResponse,
} from "@rooms/contracts/ws";

export function isWsErrorResponse(payload: unknown): payload is WsErrorResponse {
	return WsErrorResponseSchema.safeParse(payload).success;
}

export function getWsErrorMessage(
	payload: unknown,
	fallback = "Unexpected realtime error",
): string {
	if (!isWsErrorResponse(payload)) {
		return fallback;
	}

	if ("error" in payload) {
		return payload.error;
	}

	return payload.message;
}

export function getWsErrorCode(payload: unknown): string | undefined {
	if (!isWsErrorResponse(payload)) {
		return undefined;
	}

	if ("code" in payload && typeof payload.code === "string") {
		return payload.code;
	}

	return undefined;
}

export function getWsValidationIssues(
	payload: unknown,
): DomainWsValidationIssue[] {
	if (!isWsErrorResponse(payload)) {
		return [];
	}

	if (!("issues" in payload) || !Array.isArray(payload.issues)) {
		return [];
	}

	return payload.issues;
}
