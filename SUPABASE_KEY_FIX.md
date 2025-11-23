# 🔐 Fixing Supabase API Key Error

## ❌ The Problem

You're getting this error:
```
"Secret API keys can only be used in a protected environment and should never be used in a browser. Delete this secret API key immediately!"
```

This means you're using Supabase's **secret service_role key** instead of the **public anon key** in your browser application.

## 🔑 Understanding Supabase Keys

Supabase provides two types of API keys:

### 1. **Anon Key** (Public Key) ✅
- **Safe to use in the browser**
- Used for client-side authentication
- Respects Row Level Security (RLS) policies
- This is what you should use

### 2. **Service Role Key** (Secret Key) ⚠️
- **NEVER use in the browser**
- Only for server-side use
- Bypasses all RLS policies
- Has full database access

## 🛠️ How to Fix

### Step 1: Find Your Correct Keys

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. You'll see two keys:
   - **Project URL** (example: `https://abcdefghijk.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`) ⚠️ DON'T USE THIS

### Step 2: Create Environment File

Create a `.env.local` file in `/apps/web/`:

```bash
# apps/web/.env.local

# Your Supabase project URL
VITE_SUPABASE_URL=https://your-project.supabase.co

# Your Supabase ANON/PUBLIC key (the one labeled "anon public")
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Security Check

✅ **Use this key:** The one labeled "anon public" in Supabase dashboard
❌ **Don't use:** The one labeled "service_role"

### Step 4: Restart Your Dev Server

```bash
# Stop your current dev server (Ctrl+C)
# Then restart it
make dev
```

## 🔒 What I've Changed

1. **Updated `auth-context.tsx`:**
   - Changed from `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` to `VITE_SUPABASE_ANON_KEY`
   - More explicit naming to prevent confusion

2. **Created `.env.example`:**
   - Template file with proper instructions
   - Clear warnings about which key to use

3. **Created `.gitignore`:**
   - Ensures your `.env.local` file is never committed to git
   - Protects your keys from being exposed

## ⚠️ Important Security Steps

### If You Accidentally Committed the Secret Key:

1. **Immediately revoke the key in Supabase:**
   - Go to Settings → API in Supabase dashboard
   - Click "Reset service_role key"

2. **Remove it from git history:**
   ```bash
   # If you committed it
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env.local' \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Use a new key and never commit it again**

## 📝 Quick Setup Commands

```bash
# 1. Navigate to the web app directory
cd apps/web

# 2. Create your local environment file
cp .env.example .env.local

# 3. Edit the file with your actual keys
# Use the ANON key from Supabase dashboard
nano .env.local  # or use your preferred editor

# 4. Restart your dev server
make dev
```

## ✅ Verify It's Working

After setting up your `.env.local` file:

1. The error should disappear
2. Login should work properly
3. Check browser console - no more warnings

## 🔍 Environment Variable Naming

| Old Name | New Name | Purpose |
|----------|----------|---------|
| `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | `VITE_SUPABASE_ANON_KEY` | Public anonymous key for browser use |

The new name is clearer and matches Supabase's official naming convention.

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [API Keys Documentation](https://supabase.com/docs/guides/api/api-keys)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)



