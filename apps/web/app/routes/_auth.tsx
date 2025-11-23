import { redirect } from "react-router"

import { getUser } from "@/services/auth-service"

export async function clientLoader() {
  const result = await getUser()

  if (result.ok) return redirect("/")

  return null
}
