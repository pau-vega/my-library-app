import { redirect } from "react-router"

import { authService } from "@/services/auth-service"

export async function clientLoader() {
  const result = await authService.getUser()

  if (result.ok) return redirect("/")

  return null
}
