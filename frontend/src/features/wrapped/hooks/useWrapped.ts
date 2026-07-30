import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/features/auth"
import { WrappedService } from "../services/wrapped.service"

export function useWrapped(year: string) {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["wrapped", year, userId],
    queryFn: () => WrappedService.generateWrapped(userId, year),
    enabled: !!userId && !!year,
    staleTime: 12 * 60 * 60 * 1000, // Cache for 12 hours
  })
}
export default useWrapped
