# Supabase Setup Guide

## Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ljwyqtseerohiprfzlox.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqd3lxdHNlZXJvaGlwcmZ6bG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDAwODUsImV4cCI6MjA2NTQxNjA4NX0.ROJk3Js-0ryKPs7mfpyEoRo3OKeZ-rujJQbuOWRef5g
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Client Types

### 1. Browser Client (`src/lib/supabase/client.ts`)

For client-side components and user authentication:

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
```

### 2. Server Client (`src/lib/supabase/server.ts`)

For server components and server actions with user context:

```typescript
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
```

### 3. Admin Client (`src/lib/supabase/admin.ts`)

For API routes that need to bypass RLS (Row Level Security):

```typescript
import { createAdminClient } from "@/lib/supabase/admin";

const supabase = createAdminClient();
```

## Usage Examples

### API Route with Admin Access

```typescript
// app/api/users/route.ts
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createAdminClient();

  const { data, error } = await supabase.from("profiles").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
```

### Server Action with User Context

```typescript
// app/actions/profile.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ name: formData.get("name") })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profile");
}
```

## Security Notes

- **Publishable Key**: Safe for client-side use, respects RLS policies
- **Service Role Key**: Server-side only, bypasses RLS - keep secure!
- **Admin Client**: Use only in API routes, never expose to client-side code

## Getting Your Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "service_role" key (not the "anon" key)
4. Add it to your `.env.local` file as `SUPABASE_SERVICE_ROLE_KEY`
