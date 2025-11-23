"use client"

import {
  Avatar,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Spinner,
} from "@my-library-app/ui"
import { LogOut } from "lucide-react"
import * as React from "react"

import { useAuth } from "@/hooks"

export default function ProfileDropdown() {
  const { logout, user } = useAuth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-2xl">
          {user ? (
            <Avatar>
              <AvatarImage src={user.user_metadata.avatar_url} alt={user.email} />
            </Avatar>
          ) : (
            <Spinner />
          )}
        </Button>
      </DropdownMenuTrigger>
      {user && (
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-sm font-bold">{user.user_metadata.name}</DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => logout()}
            className="text-destructive focus:text-destructive hover:bg-error/10 focus:bg-error/10 cursor-pointer"
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  )
}
