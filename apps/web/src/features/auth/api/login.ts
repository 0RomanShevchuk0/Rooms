import { api } from "@/shared/api";
import { AuthCredentials } from "../model/types";
import { AuthTokenResponse } from "@/entities/session";

export async function login(data: AuthCredentials): Promise<AuthTokenResponse> {
	return await api.post<AuthTokenResponse, AuthCredentials>("/auth/login", data);
}
