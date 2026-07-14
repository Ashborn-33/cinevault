import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/features/auth"
import { SettingsService } from "../services/settings.service"
import type { UserPreferences } from "../types/settings"

export function usePreferences() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["settings", "preferences", userId],
    queryFn: () => SettingsService.getPreferences(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (updates: Partial<UserPreferences>) =>
      SettingsService.updatePreferences(userId, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(["settings", "preferences", userId], data)
      queryClient.invalidateQueries({ queryKey: ["settings", "preferences", userId] })
    },
  })
}

export function useResetPreferences() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: () => SettingsService.resetPreferences(userId),
    onSuccess: (data) => {
      queryClient.setQueryData(["settings", "preferences", userId], data)
      queryClient.invalidateQueries({ queryKey: ["settings", "preferences", userId] })
    },
  })
}
export default usePreferences
