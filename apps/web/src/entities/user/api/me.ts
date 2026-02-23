import { api } from "@/shared/api";
import type { User } from "../model/types";

export async function getMe(): Promise<User> {
	return await api.get<User>("/users/me");
}
