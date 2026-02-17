import { api } from "@/shared/api";
import type { AuthTokenResponse } from "../types";

export async function refreshTokens(): Promise<AuthTokenResponse> {
	return await api.post<AuthTokenResponse>("/auth/refresh-tokens");
}
