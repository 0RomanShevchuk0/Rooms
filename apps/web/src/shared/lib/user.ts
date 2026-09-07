export function getUserInitial(username: string): string {
	return username.trim().charAt(0).toUpperCase();
}
