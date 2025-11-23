# Authentication Flow Implementation

## Overview

This document outlines the authentication flow implementation for the My Library App. The implementation ensures that:

1. **Protected Routes**: Users can only access the dashboard when authenticated
2. **Smart Redirects**: Authenticated users visiting the login page are redirected to their intended destination or the dashboard
3. **Session Management**: Proper handling of login, logout, and session state

## Components Created/Modified

### 1. Protected Route Component (`apps/web/app/components/protected-route.tsx`)

A reusable wrapper component that protects routes requiring authentication.

**Features:**
- Checks if user has an active session
- Redirects to `/login` if not authenticated
- Uses `replace` navigation to prevent back-button issues

**Usage:**
```tsx
<ProtectedRoute>
  <DashboardContent />
</ProtectedRoute>
```

### 2. Updated Login Page (`apps/web/app/routes/_auth.login.tsx`)

**Features:**
- Automatically redirects authenticated users to their intended destination
- Supports `redirectTo` query parameter for deep linking
- Falls back to dashboard if no redirect URL is specified
- Prevents rendering of login form when user is already authenticated

**Example URL:**
```
/login?redirectTo=/dashboard
```

### 3. Enhanced Auth Context (`apps/web/app/context/auth-context.tsx`)

**Features:**
- Updated `login` function to accept optional `redirectTo` parameter
- Modified `logout` function to redirect to home page after logout
- Maintains session state across the application

**API:**
```typescript
type AuthContext = {
  session: Session | null
  logout: () => void
  login: (redirectTo?: string) => void
}
```

### 4. Updated Login Form (`apps/web/app/components/login-form.tsx`)

**Features:**
- Reads `redirectTo` from URL query parameters
- Passes redirect URL to the login function
- Preserves user's intended destination after authentication

### 5. Protected Dashboard (`apps/web/app/routes/dashboard.tsx`)

**Features:**
- Wrapped in `ProtectedRoute` component
- Displays user email in header
- Includes logout button with icon
- Shows user session information

### 6. Enhanced Home Page (`apps/web/app/routes/_index.tsx`)

**Features:**
- Shows different UI based on authentication state
- Displays user email when logged in
- Provides navigation to dashboard or login page
- Includes logout functionality

## Authentication Flow

### Unauthenticated User Flow

1. User tries to access `/dashboard`
2. `ProtectedRoute` checks for session
3. User is redirected to `/login`
4. User clicks "Continue with Github"
5. After successful authentication, user is redirected to `/dashboard`

### Authenticated User Flow

1. User is already logged in
2. User tries to access `/login`
3. `LoginPage` detects active session
4. User is automatically redirected to `/dashboard` (or `redirectTo` parameter if present)

### Deep Link Flow

1. Unauthenticated user tries to access `/dashboard`
2. User is redirected to `/login?redirectTo=/dashboard`
3. After authentication, user is redirected to `/dashboard`

### Logout Flow

1. User clicks logout button
2. Session is cleared from Supabase
3. User is redirected to home page (`/`)

## Security Considerations

- All protected routes must be wrapped with `ProtectedRoute`
- Session state is managed by Supabase
- OAuth callback URLs are validated by Supabase
- `replace` navigation prevents back-button security issues

## Testing Checklist

- [ ] Unauthenticated users cannot access dashboard
- [ ] Unauthenticated users are redirected to login
- [ ] Authenticated users are redirected from login page
- [ ] Deep links work correctly with `redirectTo` parameter
- [ ] Logout redirects to home page
- [ ] User email is displayed in dashboard header
- [ ] Session persists across page refreshes

## Future Enhancements

- Add role-based access control (RBAC)
- Implement password reset flow
- Add remember me functionality
- Include session timeout handling
- Add loading states during authentication



