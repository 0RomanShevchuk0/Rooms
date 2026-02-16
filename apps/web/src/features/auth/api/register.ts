import { api } from "@/shared/api";
import { AuthCredentials, AuthTokenResponse } from "../model/types";

export async function register(data: AuthCredentials): Promise<AuthTokenResponse> {
	return await api.post<AuthTokenResponse, AuthCredentials>("/auth/register", data);
}
