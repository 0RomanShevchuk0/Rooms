import { api } from "@/shared/api";
import type { User } from "@rooms/contracts/user";

export async function getMe(): Promise<User> {
	return await api.get<User>("/users/me");
}
