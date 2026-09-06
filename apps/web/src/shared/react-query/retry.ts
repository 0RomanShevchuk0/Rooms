import axios from "axios";

const MAX_RETRIES = 2;

export function getHttpStatus(error: unknown): number | undefined {
	return axios.isAxiosError(error) ? error.response?.status : undefined;
}

/**
 * Retries only what a second attempt can fix — a dropped connection or a 5xx.
 * A 4xx is the server's answer, not a blip, and repeating it just delays the
 * error screen.
 */
export function retryOnTransientError(failureCount: number, error: unknown): boolean {
	if (failureCount >= MAX_RETRIES) return false;

	const status = getHttpStatus(error);

	return status === undefined || status >= 500;
}
