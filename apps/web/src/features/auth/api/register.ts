import { api } from "@/shared/api";
import type { AuthCredentials, AuthTokenResponse } from "@rooms/contracts/auth";

export async function register(data: AuthCredentials): Promise<AuthTokenResponse> {
	return await api.post<AuthTokenResponse, AuthCredentials>("/auth/register", data);
}
