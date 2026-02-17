import { api } from "@/shared/api";
import { AuthTokenResponse } from "@/entities/session";

export async function refreshTokens(): Promise<AuthTokenResponse> {
	return await api.post<AuthTokenResponse>("/auth/refresh-tokens");
}
