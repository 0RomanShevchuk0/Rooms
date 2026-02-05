import type { User } from "@/entities/user";

export interface Room {
  id: string;
  name: string;

  players: User[];
}
