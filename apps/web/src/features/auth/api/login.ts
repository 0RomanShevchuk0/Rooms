import { api } from "@/shared/api";
import { AuthCredentials, AuthTokenResponse } from "../model/types";

export async function login(data: AuthCredentials): Promise<AuthTokenResponse> {
	return await api.post<AuthTokenResponse, AuthCredentials>("/auth/login", data);
}
