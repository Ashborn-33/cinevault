import { useAuth } from "@/features/auth"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { DeleteAccountService } from "../services/deleteAccount.service"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function useDeleteAccount() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("No authenticated session found. Please sign in again.")
      }
      await DeleteAccountService.deleteAccount(user.id)
    },
    onSuccess: () => {
      // Clear all React Query query caches dynamically
      queryClient.clear()
      toast.success("Account permanently deleted.")
      // Redirect to Landing Page
      navigate("/")
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error
          ? err.message
          : "We couldn't complete account deletion. Please try again."
      toast.error(msg)
    },
  })
}
