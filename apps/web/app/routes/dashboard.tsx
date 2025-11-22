import { Button } from "@my-library-app/ui"

import { useAuth } from "@/context/auth-context"

import type { Route } from "./+types/_index"

export function meta({}: Route.MetaArgs) {
  return [{ title: "New React Router App" }, { name: "description", content: "Welcome to React Router!" }]
}

export default function Dashboard() {
  const { session, logout } = useAuth()
  return (
    <div>
      Dashboard
      <div>{session?.user?.email}</div>
      <Button onClick={logout}>Logout</Button>
    </div>
  )
}
