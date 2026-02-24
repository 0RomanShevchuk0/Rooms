"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User } from "lucide-react";

import { useSession, logout } from "@/entities/session";
import { getMe } from "@/entities/user";
import { queryKeys, mutationKeys } from "@/shared/react-query";
import { ROUTES } from "@/shared/routes";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

function getInitial(username: string): string {
	return username.charAt(0).toUpperCase();
}

export function UserMenu() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { clearSession, accessToken } = useSession();

	const { data: user } = useQuery({
		queryKey: queryKeys.user.me(),
		queryFn: getMe,
		enabled: !!accessToken,
		staleTime: 1000 * 60 * 5,
	});

	const logoutMutation = useMutation({
		mutationKey: mutationKeys.auth.logout(),
		mutationFn: logout,
		onSettled: () => {
			clearSession();
			queryClient.clear();
			router.replace(ROUTES.auth.login);
		},
	});

	const handleLogout = () => {
		logoutMutation.mutate();
	};

	if (!user) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className="group flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-2.5 py-1.5 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 cursor-pointer"
					aria-label="User menu"
				>
					<span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
						{user ? getInitial(user.username) : <User className="size-3" />}
					</span>
					{user && <span className="max-w-[120px] truncate font-medium text-foreground">{user.username}</span>}
					<ChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded:rotate-180" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-48">
				{user && (
					<>
						<DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-2">
							<span className="text-sm font-semibold text-foreground">{user.username}</span>
							{user.email && <span className="text-xs font-normal text-muted-foreground">{user.email}</span>}
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
					</>
				)}
				<DropdownMenuItem
					variant="destructive"
					onSelect={handleLogout}
					disabled={logoutMutation.isPending}
					className="cursor-pointer"
				>
					<LogOut />
					{logoutMutation.isPending ? "Logging out…" : "Log out"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
