import { api } from "@/shared/api";
import { AuthCredentials } from "../model/types";
import { AuthTokenResponse } from "@/entities/session";

export async function register(data: AuthCredentials): Promise<AuthTokenResponse> {
	return await api.post<AuthTokenResponse, AuthCredentials>("/auth/register", data);
}
