import * as React from "react"
import { ProfileContext } from "../providers/ProfileProvider"

export function useProfile() {
  const context = React.useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
