type DomainWsErrorResponse = {
	error: string;
	code?: string;
};

type NestWsErrorResponse = {
	status: "error";
	message: string;
	cause?: unknown;
};

export type WsErrorResponse = DomainWsErrorResponse | NestWsErrorResponse;

export function isWsErrorResponse(payload: unknown): payload is WsErrorResponse {
	if (!payload || typeof payload !== "object") {
		return false;
	}

	const record = payload as Record<string, unknown>;

	if (typeof record.error === "string") {
		return true;
	}

	return record.status === "error" && typeof record.message === "string";
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
