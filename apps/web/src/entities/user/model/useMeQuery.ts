import { queryKeys } from "@/shared/react-query";
import { getMe } from "../api";
import { useQuery } from "@tanstack/react-query";

interface UseMeQueryProps {
	enabled?: boolean;
};

export function useMeQuery({ enabled = true }: UseMeQueryProps = {}) {
	const { data: user } = useQuery({
		queryKey: queryKeys.user.me(),
		queryFn: getMe,
		enabled: enabled,
		staleTime: 1000 * 60 * 5,
	});

	return { user };
}
