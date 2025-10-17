# Production Deployment Guide

This guide covers deploying your Workflow Automation Builder to production with proper Gmail OAuth verification.

---

## 🎯 Production Checklist

- [ ] Complete Google OAuth App Verification
- [ ] Set up production environment variables
- [ ] Configure production redirect URIs
- [ ] Enable email confirmations in Supabase
- [ ] Set up proper error handling
- [ ] Configure security headers
- [ ] Set up monitoring and logging

---

## 📋 Part 1: Google OAuth Verification (Required for Production)

### Why Verification is Needed

In **Testing mode**, only 100 test users can access your app. For production with unlimited users, you must **publish your OAuth consent screen** and get Google's approval.

### Step 1: Prepare Your OAuth Consent Screen

Go to [Google Cloud Console](https://console.cloud.google.com/) → OAuth consent screen:

#### **App Information**

```
App name: Workflow Automation Builder (or your brand name)
User support email: support@yourdomain.com
App logo: Upload a 120x120px logo (optional but recommended)
App domain: https://yourdomain.com
```

#### **App Privacy Policy & Terms** (REQUIRED for verification)

You need to host these pages:

- Privacy Policy URL: `https://yourdomain.com/privacy`
- Terms of Service URL: `https://yourdomain.com/terms`

**Quick templates included below** ↓

#### **Authorized Domains**

```
yourdomain.com
```

#### **Developer Contact Information**

```
your-email@yourdomain.com
```

### Step 2: Configure Scopes (Be Specific!)

Click **"ADD OR REMOVE SCOPES"** and add ONLY what you need:

**Required Scopes:**

```
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.compose
https://www.googleapis.com/auth/gmail.modify
https://www.googleapis.com/auth/userinfo.email
```

**Justification for each scope:**

- `.readonly` - Read emails for triage and automation
- `.send` - Send emails and responses
- `.compose` - Create draft emails
- `.modify` - Mark emails as read, apply labels
- `.userinfo.email` - Identify which Gmail account is connected

### Step 3: Prepare Verification Documentation

Google will ask you to demonstrate how you use each scope. Create a video showing:

1. **User clicks "Connect Gmail"**
2. **OAuth flow** (your consent screen)
3. **Show the app** reading emails (`.readonly` scope)
4. **Show the app** sending an email (`.send` scope)
5. **Show the app** creating a draft (`.compose` scope)
6. **Show the app** modifying labels (`.modify` scope)

**Tips:**

- Use screen recording software (Loom, QuickTime, etc.)
- Keep it under 5 minutes
- Clearly show the OAuth consent screen
- Demonstrate each scope in action
- Upload to YouTube (unlisted is fine)

### Step 4: Submit for Verification

1. **Click "PUBLISH APP"** on the OAuth consent screen
2. **Fill out the verification form:**
   - App description
   - Privacy policy link
   - Terms of service link
   - Video demonstration link
   - Justification for each scope
3. **Submit for review**

**Timeline:** Usually 1-4 weeks for approval

### Step 5: While Waiting for Approval

Your app stays in "Testing" mode but you can:

- Add up to 100 test users
- Deploy to production (test users only)
- Continue development
- Onboard beta users manually

---

## 🌐 Part 2: Production Environment Setup

### Environment Variables

Create separate `.env.production` or use your hosting platform's env vars:

```bash
# Production URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-prod-anon-key

# Google OAuth (Production)
GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-production-secret

# API Keys
ANTHROPIC_API_KEY=your-production-api-key
OPENAI_API_KEY=your-production-openai-key

# Asana (System-wide token for server)
ASANA_ACCESS_TOKEN=your-asana-token

# Redis (Production)
REDIS_URL=rediss://default:password@your-redis-url:6379

# Supabase (Server-side)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Update Google OAuth Redirect URIs

In Google Cloud Console → Credentials → Your OAuth Client:

**Authorized redirect URIs:**

```
http://localhost:3000/api/integrations/gmail/callback  (keep for dev)
https://yourdomain.com/api/integrations/gmail/callback  (add for prod)
```

### Update Supabase Settings

In Supabase Dashboard → Authentication → Settings:

**Site URL:**

```
https://yourdomain.com
```

**Redirect URLs:**

```
https://yourdomain.com/**
https://yourdomain.com/api/integrations/gmail/callback
```

**Email Confirmations:**

- ✅ **ENABLE** for production (security!)

---

## 🔒 Part 3: Security for Production

### 1. Environment Variable Security

**DO NOT:**

- ❌ Commit `.env.local` or `.env.production` to git
- ❌ Expose API keys in client-side code
- ❌ Log sensitive tokens to console

**DO:**

- ✅ Use platform environment variables (Vercel, Railway, etc.)
- ✅ Rotate API keys every 90 days
- ✅ Use different keys for dev/staging/prod
- ✅ Monitor API usage for anomalies

### 2. Add Security Headers

Update `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Production security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};
```

### 3. Rate Limiting (Recommended)

Add rate limiting to prevent abuse:

```typescript
// In /api/integrations/gmail/connect/route.ts
// Add at the top:

import { redis } from "@/lib/redis";

// In the GET function, before OAuth redirect:
const userId = user.id;
const rateLimitKey = `ratelimit:gmail:${userId}`;
const attempts = await redis.incr(rateLimitKey);

if (attempts === 1) {
  await redis.expire(rateLimitKey, 3600); // 1 hour window
}

if (attempts > 5) {
  return NextResponse.json(
    { error: "Too many connection attempts. Please try again later." },
    { status: 429 }
  );
}
```

---

## 🚀 Part 4: Deployment Platforms

### Vercel (Recommended - Easy)

1. **Push to GitHub**
2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repo
   - Vercel auto-detects Next.js
3. **Set Environment Variables**:
   - Settings → Environment Variables
   - Add all from `.env.production`
4. **Deploy**!

**Custom Domain:**

- Settings → Domains → Add yourdomain.com
- Update `NEXT_PUBLIC_APP_URL` to match

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Set environment variables
railway variables set NEXT_PUBLIC_APP_URL=https://yourdomain.com
railway variables set GOOGLE_CLIENT_ID=your-id
# ... set all other vars

# Deploy
railway up
```

### Docker (Any Platform)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Deploy to: AWS, Google Cloud, Azure, DigitalOcean, etc.

---

## 📄 Part 5: Required Legal Pages

### Privacy Policy Template

Create `/app/privacy/page.tsx`:

```typescript
export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data Collection</h2>
        <p className="mb-4">
          Our Workflow Automation Builder collects and processes the following
          data:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Account Information:</strong> Email address for
            authentication
          </li>
          <li>
            <strong>Gmail Data:</strong> Access tokens to read and send emails
            on your behalf
          </li>
          <li>
            <strong>Asana Data:</strong> Access tokens to manage your tasks
          </li>
          <li>
            <strong>Workflow Configurations:</strong> Your saved automation
            workflows
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">How We Use Your Data</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Execute automation workflows you create</li>
          <li>Connect to your Gmail and Asana accounts as authorized</li>
          <li>Store workflow configurations for your use</li>
          <li>We do NOT sell or share your data with third parties</li>
          <li>We do NOT store email content permanently</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
        <p className="mb-4">
          We implement industry-standard security measures:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>OAuth tokens encrypted at rest in Supabase</li>
          <li>All API calls use HTTPS</li>
          <li>Row-level security policies prevent unauthorized access</li>
          <li>You can disconnect services anytime</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Disconnect Gmail or Asana at any time</li>
          <li>Delete your account and all data</li>
          <li>Revoke access from Google Account settings</li>
          <li>Request data export (contact support)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
        <p>
          For privacy questions:{" "}
          <a
            href="mailto:privacy@yourdomain.com"
            className="text-blue-600 underline"
          >
            privacy@yourdomain.com
          </a>
        </p>
      </section>

      <p className="text-sm text-gray-600 mt-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
```

### Terms of Service Template

Create `/app/terms/page.tsx`:

```typescript
export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
        <p>By using Workflow Automation Builder, you agree to these terms.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
        <p className="mb-4">
          We provide a visual workflow builder that allows you to create
          AI-powered automation workflows connecting Gmail, Asana, and other
          services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>You are responsible for workflows you create</li>
          <li>Do not use the service for spam or malicious purposes</li>
          <li>Keep your account credentials secure</li>
          <li>Comply with Gmail and Asana terms of service</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Limitations</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Service provided "as is" without warranties</li>
          <li>We are not liable for email or task management errors</li>
          <li>Subject to API rate limits from Gmail and Asana</li>
        </ul>
      </section>

      <p className="text-sm text-gray-600 mt-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
```

---

## 🔐 Part 6: Google OAuth Verification Process

### Timeline

- **Preparation:** 1-2 days
- **Google Review:** 1-4 weeks
- **Total:** ~2-6 weeks

### What Google Reviews

1. **Scopes Justification**

   - Why do you need Gmail access?
   - How do you use each scope?
   - Video demonstration

2. **Privacy & Security**

   - Privacy policy (must be publicly accessible)
   - Terms of service
   - Data handling practices
   - Security measures

3. **App Functionality**
   - Working demo
   - Clear description
   - Brand assets (logo, screenshots)

### Submission Checklist

**Before submitting:**

- [ ] Privacy policy live at `https://yourdomain.com/privacy`
- [ ] Terms of service live at `https://yourdomain.com/terms`
- [ ] App deployed and accessible
- [ ] Demo video uploaded (YouTube unlisted)
- [ ] All scopes have clear justifications
- [ ] OAuth consent screen fully filled out

**To Submit:**

1. OAuth consent screen → Click **"PUBLISH APP"**
2. Complete the verification questionnaire
3. Provide all requested documentation
4. Submit

**Response Time:**

- Initial review: 3-5 business days
- Clarifications: May request additional info
- Final approval: 1-4 weeks total

---

## 🌍 Part 7: Production Deployment Steps

### Option A: Vercel (Easiest)

#### 1. Push to GitHub

```bash
git add .
git commit -m "Production ready"
git push origin main
```

#### 2. Deploy to Vercel

- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repo
- Configure:
  - Framework: Next.js (auto-detected)
  - Root Directory: `./`
  - Build Command: `npm run build`
  - Output Directory: `.next`

#### 3. Set Environment Variables in Vercel

Settings → Environment Variables → Add all:

```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
GOOGLE_CLIENT_ID=your-prod-client.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-prod-secret
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
ASANA_ACCESS_TOKEN=your-asana-token
REDIS_URL=rediss://...
```

**Important:** Set environment for **Production** (not Preview)

#### 4. Add Custom Domain (Optional)

- Vercel Settings → Domains
- Add `yourdomain.com`
- Update `NEXT_PUBLIC_APP_URL` to match
- Redeploy

#### 5. Update Google OAuth Redirect URI

```
https://yourdomain.com/api/integrations/gmail/callback
```

### Option B: Railway

```bash
# Install CLI
npm i -g @railway/cli

# Login and init
railway login
railway init

# Add environment variables via dashboard
# Then deploy
railway up
```

### Option C: Docker + Any Cloud

See Dockerfile in this guide (Part 4).

Deploy to:

- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Apps
- DigitalOcean App Platform

---

## ✅ Part 8: Post-Deployment Verification

### Test These Flows:

1. **User Registration**

   - Visit production URL
   - Sign up with email
   - Check email confirmation works
   - Verify profile created in Supabase

2. **Gmail OAuth**

   - Log in
   - Create MCP Agent node
   - Click "Connect Gmail"
   - Complete OAuth flow
   - Verify tokens stored in database

3. **Workflow Execution**

   - Create a simple workflow
   - Execute it
   - Verify it runs successfully
   - Check execution history

4. **Error Handling**
   - Try invalid credentials
   - Test disconnecting services
   - Verify error messages are clear

### Monitoring

Set up monitoring for:

- **API Errors:** Sentry, LogRocket
- **Uptime:** UptimeRobot, Pingdom
- **Performance:** Vercel Analytics
- **API Usage:** Track Anthropic/OpenAI costs

---

## 🎓 Part 9: During "Testing" Phase (Before Verification)

While waiting for Google verification, you can still launch with limitations:

### Strategy 1: Invite-Only Beta (100 users max)

1. Add beta users as "Test users" in Google Cloud Console
2. Manually onboard each user
3. Collect feedback
4. Iterate on product

### Strategy 2: Waitlist

1. Create a landing page
2. Collect emails for waitlist
3. Add approved users as test users
4. Gradual rollout

### Strategy 3: Enterprise/Internal Use

If building for a specific organization:

- Set OAuth to "Internal" (Google Workspace only)
- No verification needed
- Unlimited users in your workspace

---

## 📊 Part 10: Production Monitoring

### Key Metrics to Track

1. **Authentication**

   - Signup rate
   - Login success/failure
   - Session duration

2. **Gmail OAuth**

   - Connection success rate
   - OAuth failures (by error type)
   - Token refresh failures

3. **Workflow Execution**

   - Executions per day
   - Success/failure rate
   - Average execution time
   - Tool call distribution

4. **API Costs**
   - Anthropic API usage (tokens)
   - OpenAI API usage
   - Gmail API quota usage

### Logging

Add structured logging:

```typescript
// Example in execute route
console.log(
  JSON.stringify({
    timestamp: new Date().toISOString(),
    event: "workflow_executed",
    user_id: user.id,
    node_type: "mcpAgent",
    tools_used: allMCPTools.length,
    success: true,
    duration_ms: executionTime,
  })
);
```

---

## 🔄 Part 11: Ongoing Maintenance

### Monthly Tasks

- [ ] Review API usage and costs
- [ ] Check for failed OAuth refreshes
- [ ] Monitor error logs
- [ ] Update dependencies
- [ ] Review user feedback

### Quarterly Tasks

- [ ] Rotate API keys
- [ ] Review and update scopes
- [ ] Security audit
- [ ] Performance optimization
- [ ] Update documentation

### As Needed

- [ ] Respond to Google verification requests
- [ ] Add new MCP servers
- [ ] Scale infrastructure
- [ ] Handle abuse reports

---

## 🎯 Production Launch Checklist

**Before launching to public:**

- [ ] Google OAuth verification **APPROVED**
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Production environment variables set
- [ ] Database migration run on production Supabase
- [ ] Custom domain configured
- [ ] SSL certificate active (auto with Vercel)
- [ ] Error monitoring enabled
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] Backup strategy in place
- [ ] Support email configured
- [ ] Documentation updated
- [ ] Beta testing completed
- [ ] Performance testing done

---

## 💡 Pro Tips

### 1. Start Small

- Launch in beta (test users only)
- Get 10-20 users actively using it
- Collect feedback and iterate
- Then submit for verification

### 2. Clear Use Case

- Google approves apps with clear, legitimate use cases
- "Email and task automation" is clear and approved
- Have real examples ready to show

### 3. Be Responsive

- Google may ask for clarifications
- Respond quickly (within 24-48 hours)
- Provide additional videos/docs if requested

### 4. Alternative During Verification

- Use "Internal" OAuth for Google Workspace domains
- Or limit to 100 beta testers
- Or use service accounts for enterprise customers

---

## 📞 Support Resources

- **Google OAuth Verification:** https://support.google.com/cloud/answer/9110914
- **Supabase Production:** https://supabase.com/docs/guides/platform/going-into-prod
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Vercel Deployment:** https://vercel.com/docs

---

## ✨ Summary: Development → Production

| Stage           | Users     | Setup                        |
| --------------- | --------- | ---------------------------- |
| **Development** | Just you  | Test users in Google Console |
| **Beta**        | Up to 100 | Add test users manually      |
| **Production**  | Unlimited | Google verification required |

**Current Status:** You're in Development/Beta mode  
**Next Step:** Submit for Google verification or launch with 100 test users  
**Timeline to Public:** ~2-6 weeks (verification process)

---

**Questions?** See `MCP_AGENT_SETUP.md` for operational details or `SUPABASE_AUTH_SETUP.md` for auth troubleshooting.
