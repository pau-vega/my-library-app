import { Menu } from "lucide-react"

import ProfileDropdown from "../profile-dorpdown"

export function Navigation() {
  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-10 border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Menu />

        <ProfileDropdown />
      </div>
    </header>
  )
}
