# Supabase Auth Setup - Quick Fix for 431 Error

## 🚨 Fixing "431 Request Header Fields Too Large" Error

If you're seeing this error, it's because Supabase cookies are too large. Here's the fix:

### Step 1: Configure Supabase Auth Settings

Go to your [Supabase Dashboard](https://app.supabase.com/):

1. Select your project
2. Click **Authentication** in the left sidebar
3. Click **Settings** tab
4. Make these changes:

#### **Site URL**

```
http://localhost:3000
```

(Change to your production URL when deploying)

#### **Redirect URLs** (Add these)

```
http://localhost:3000/**
http://localhost:3000/api/integrations/gmail/callback
```

#### **Disable Email Confirmations** (For Development)

- Scroll to "Email Auth"
- **Uncheck** "Enable email confirmations"
- This prevents extra cookies and speeds up testing

#### **JWT Expiry** (Optional - reduces cookie refreshes)

- JWT expiry: `3600` (1 hour)
- Refresh token expiry: `604800` (7 days)

#### **Save Changes**

### Step 2: Clear Browser Data

The 431 error might persist due to old cookies:

1. **Clear cookies** for localhost:3000
   - Chrome: DevTools → Application → Cookies → Delete all
   - Firefox: DevTools → Storage → Cookies → Delete all
2. **Hard refresh** the page (Cmd+Shift+R or Ctrl+Shift+R)

### Step 3: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Step 4: Test Authentication

1. Visit http://localhost:3000
2. You should see the auth dialog (no 431 error!)
3. Click "Sign Up" tab
4. Enter email + password
5. Click "Create Account"
6. Should log in immediately (since email confirmation is disabled)

---

## ✅ Verification

After setup, verify:

- ✅ No 431 errors in console
- ✅ Auth dialog appears
- ✅ Can sign up with email/password
- ✅ Can log in
- ✅ Session persists on refresh
- ✅ Can access workflow builder

---

## 🔧 Alternative Fix: Increase Next.js Header Limit

If you still see 431 errors, add this to `next.config.ts`:

```typescript
const nextConfig = {
  // ... existing config
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Increase header size limit
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Max-Age",
            value: "86400",
          },
        ],
      },
    ];
  },
};
```

However, **fixing Supabase settings is the proper solution.**

---

## 🎯 Why This Happens

Supabase Auth cookies can be large because they contain:

- Access token (JWT)
- Refresh token
- Session metadata
- PKCE verifier (for OAuth)

When email confirmation is enabled, additional cookies are added, which can exceed Next.js header limits (default ~16KB).

**Solution:** Disable email confirmation for development, configure proper URLs, and clear old cookies.

---

## 📝 Supabase Dashboard Settings Checklist

```
Authentication → Settings:

✅ Site URL: http://localhost:3000
✅ Redirect URLs: http://localhost:3000/** added
✅ Email confirmations: DISABLED (for dev)
✅ JWT expiry: 3600 (1 hour)
✅ Save all changes
```

After these changes, the 431 error should be gone! 🎉
