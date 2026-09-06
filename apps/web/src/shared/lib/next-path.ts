export const NEXT_PARAM = "next";

/**
 * Keeps only same-origin paths, so a crafted `?next=` cannot bounce someone
 * off the site after they sign in.
 */
export function sanitizeNextPath(value: string | null | undefined): string | null {
	if (!value || !value.startsWith("/")) return null;
	if (value.startsWith("//") || value.startsWith("/\\")) return null;

	return value;
}

export function withNextPath(route: string, nextPath: string | null): string {
	if (!nextPath) return route;

	return `${route}?${NEXT_PARAM}=${encodeURIComponent(nextPath)}`;
}

export function getCurrentNextPath(): string {
	return `${window.location.pathname}${window.location.search}`;
}

export function readNextPathFromLocation(): string | null {
	return sanitizeNextPath(new URLSearchParams(window.location.search).get(NEXT_PARAM));
}
