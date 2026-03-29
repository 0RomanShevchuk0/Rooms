import { api } from "@/shared/api";
import type { AuthCredentials, AuthTokenResponse } from "@rooms/contracts/auth";

export async function login(data: AuthCredentials): Promise<AuthTokenResponse> {
	return await api.post<AuthTokenResponse, AuthCredentials>("/auth/login", data);
}
