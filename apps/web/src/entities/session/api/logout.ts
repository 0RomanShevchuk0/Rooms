import { api } from "@/shared/api";

export async function logout(): Promise<void> {
	await api.post("/auth/logout");
}
