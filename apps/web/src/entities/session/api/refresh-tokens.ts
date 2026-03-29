import { api } from "@/shared/api";
import type { AuthRefreshTokensResponse } from "@rooms/contracts/auth";

export async function refreshTokens(): Promise<AuthRefreshTokensResponse> {
	return await api.post<AuthRefreshTokensResponse>("/auth/refresh-tokens");
}
