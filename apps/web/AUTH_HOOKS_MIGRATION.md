# Auth Hooks Migration Guide

This guide explains the improvements to the auth hooks and how to migrate from the old `useAuth` hook to the new modular approach.

## Overview of Changes

### Before: Monolithic Hook

Previously, all auth functionality was bundled into a single `useAuth` hook that:

- Managed session queries
- Managed user queries
- Handled sign-in mutations
- Handled sign-out mutations
- Subscribed to auth state changes

### After: Modular Hooks

Now, the auth functionality is split into focused, composable hooks:

- `useSession` - Session management
- `useUser` - User data management
- `useSignIn` - Sign-in operations
- `useSignOut` - Sign-out operations
- `useAuthStateSync` - Auth state synchronization
- `useAuth` - Composed convenience hook (unchanged API)

## Benefits

### 1. **Better Performance**

Use only what you need. If a component only needs session data, it doesn't re-render on user data changes:

```tsx
// Only subscribes to session changes
const { isAuthenticated } = useSession()
```

### 2. **Improved Composability**

Mix and match hooks based on your needs:

```tsx
// Component that only needs to know if user is authenticated
const ProtectedRoute = () => {
  const { isAuthenticated } = useSession()
  if (!isAuthenticated) return <Navigate to="/login" />
  return <Outlet />
}

// Component that only needs user data
const UserProfile = () => {
  const { user } = useUser()
  return <div>{user?.email}</div>
}

// Component that only needs sign-in
const LoginButton = () => {
  const { signIn, isSigningIn } = useSignIn()
  return <button onClick={() => signIn({ provider: "github" })}>Login</button>
}
```

### 3. **Centralized Query Keys**

The `authQueryKeys` factory provides type-safe, organized query keys:

```tsx
import { authQueryKeys } from "./hooks/auth"

// Invalidate all auth queries
queryClient.invalidateQueries({ queryKey: authQueryKeys.all })

// Invalidate just session
queryClient.invalidateQueries({ queryKey: authQueryKeys.session() })
```

### 4. **Better Type Safety**

Each hook has explicit return types with readonly properties:

```tsx
interface UseSessionReturn {
  readonly session: Session | null | undefined
  readonly isLoading: boolean
  readonly isError: boolean
  readonly error: Error | null
  readonly isAuthenticated: boolean
}
```

## Migration Paths

### Path 1: No Changes Required (Recommended for Most Cases)

The composed `useAuth` hook maintains the same API as before:

```tsx
// This still works!
const { session, user, isLoading, login, logout } = useAuth()
```

**Note:** Make sure `useAuthStateSync()` is called at the app root (already done in `root.tsx`).

### Path 2: Optimize with Individual Hooks (For Performance)

Replace `useAuth` with specific hooks where appropriate:

#### Example 1: Authentication Guard

**Before:**

```tsx
const ProtectedRoute = () => {
  const { session, isLoading } = useAuth() // Also fetches user unnecessarily

  if (isLoading) return <Spinner />
  if (!session) return <Navigate to="/login" />
  return <Outlet />
}
```

**After:**

```tsx
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useSession() // Only fetches session

  if (isLoading) return <Spinner />
  if (!isAuthenticated) return <Navigate to="/login" />
  return <Outlet />
}
```

#### Example 2: User Profile

**Before:**

```tsx
const UserProfile = () => {
  const { user, isLoading } = useAuth() // Also fetches session

  if (isLoading) return <Spinner />
  return <div>{user?.email}</div>
}
```

**After:**

```tsx
const UserProfile = () => {
  const { user, isLoading } = useUser() // Only fetches user

  if (isLoading) return <Spinner />
  return <div>{user?.email}</div>
}
```

#### Example 3: Login Button

**Before:**

```tsx
const LoginButton = () => {
  const { login, isSigningIn } = useAuth() // Fetches session and user unnecessarily

  return (
    <button onClick={() => login({ provider: "github" })} disabled={isSigningIn}>
      Login
    </button>
  )
}
```

**After:**

```tsx
const LoginButton = () => {
  const { signIn, isSigningIn } = useSignIn() // No queries, just the mutation

  return (
    <button onClick={() => signIn({ provider: "github" })} disabled={isSigningIn}>
      Login
    </button>
  )
}
```

## File Structure

```
apps/web/app/hooks/auth/
├── index.ts                 # Barrel export
├── auth-query-keys.ts       # Centralized query keys
├── use-auth-state-sync.ts   # Auth state synchronization
├── use-session.ts           # Session query hook
├── use-user.ts              # User query hook
├── use-sign-in.ts           # Sign-in mutation hook
├── use-sign-out.ts          # Sign-out mutation hook
└── use-auth.ts              # Composed convenience hook
```

## Best Practices

### 1. Use Specific Hooks When Possible

```tsx
// ✅ Good - Only fetches what's needed
const { isAuthenticated } = useSession()

// ❌ Less optimal - Fetches session and user
const { isAuthenticated } = useAuth()
```

### 2. Leverage Query Key Factory

```tsx
// ✅ Good - Type-safe and maintainable
queryClient.invalidateQueries({ queryKey: authQueryKeys.sessions() })

// ❌ Bad - Magic strings, error-prone
queryClient.invalidateQueries({ queryKey: ["auth", "session"] })
```

### 3. Compose Hooks in Complex Components

```tsx
// For components that need multiple auth features
const ComplexComponent = () => {
  const { session } = useSession()
  const { user } = useUser()
  const { signOut } = useSignOut()

  // Component logic
}

// Or use the convenience hook
const ComplexComponent = () => {
  const { session, user, logout } = useAuth()

  // Component logic
}
```

### 4. Don't Call useAuthStateSync Multiple Times

It's already called in `root.tsx`, so you don't need to call it elsewhere.

## Testing

Each hook can now be tested in isolation:

```tsx
import { renderHook, waitFor } from "@testing-library/react"
import { useSession } from "./use-session"

test("useSession returns session data", async () => {
  const { result } = renderHook(() => useSession())

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false)
  })

  expect(result.current.session).toBeDefined()
})
```

## Troubleshooting

### Issue: Auth state not syncing across tabs

**Solution:** Ensure `useAuthStateSync()` is called in your root component:

```tsx
// apps/web/app/root.tsx
const AppContent = () => {
  useAuthStateSync() // This is required
  return <Outlet />
}
```

### Issue: "login is not a function" error

**Solution:** Make sure you're using the new import path:

```tsx
// ✅ Correct
import { useAuth } from "./hooks/auth"

// ❌ Old path
import { useAuth } from "./hooks/use-auth"
```

### Issue: TypeScript errors with `readonly` properties

**Solution:** The return types now use `readonly` properties. You cannot reassign them:

```tsx
const { session } = useSession()
session = null // ❌ Error: Cannot assign to 'session' because it is a read-only property
```

## Summary

The refactored auth hooks follow TanStack Query best practices:

- **Separation of concerns** - Each hook has a single responsibility
- **Composability** - Mix and match hooks based on needs
- **Performance** - Only subscribe to the data you need
- **Type safety** - Explicit return types with readonly properties
- **Maintainability** - Centralized query keys and clear structure

The `useAuth` convenience hook maintains backward compatibility, so you can migrate incrementally.

