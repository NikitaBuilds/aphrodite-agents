# MCP Agent Node Setup Guide

**A visual workflow builder for automating email and task management using AI agents**

## 🎯 What This Tool Does

Build powerful automation workflows that connect AI to your actual tools:

- ✅ **Email Automation** via Gmail (read, draft, send)
- ✅ **Task Management** via Asana (create, update, organize)
- ✅ **AI Reasoning** powered by Claude
- ✅ **Visual Workflow Builder** with drag-and-drop nodes

---

## 🚀 Quick Start for Fresh Supabase Project

### Step 1: Run Database Migration

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Copy and paste the entire contents of `supabase-init-migration.sql`
6. Click **Run** or press `Cmd/Ctrl + Enter`
7. Wait for success messages ✅

This creates all necessary tables with proper security!

### Step 2: Set Up Google OAuth (For Gmail Integration)

#### Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "Workflow Automation")
3. Enable the **Gmail API**:
   - Click **APIs & Services** → **Library**
   - Search "Gmail API"
   - Click **Enable**
4. Configure OAuth Consent Screen:
   - Go to **OAuth consent screen**
   - User Type: **External**
   - App name: "Your App Name"
   - User support email: your email
   - Scopes: Click **Add or Remove Scopes** and add:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/gmail.compose`
     - `https://www.googleapis.com/auth/gmail.modify`
   - Save and Continue
5. Create OAuth Client ID:
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: "Workflow Builder"
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/integrations/gmail/callback
     ```
     For production, also add:
     ```
     https://yourdomain.com/api/integrations/gmail/callback
     ```
   - Click **Create**
6. Copy the **Client ID** and **Client Secret**

#### Add to Environment

Add to your `.env.local` file:

```bash
# Google OAuth for Gmail
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Set Up Asana

#### Get Personal Access Token

1. Log in to [Asana](https://app.asana.com/)
2. Click your profile photo → **Settings**
3. Go to **Apps** tab
4. Scroll to **Personal access tokens**
5. Click **+ New access token**
6. Name: "Workflow Automation"
7. Click **Create token**
8. **Copy the token immediately** (you won't see it again!)

#### Add to Environment

Add to your `.env.local` file:

```bash
# Asana Integration
ASANA_ACCESS_TOKEN=your-asana-token-here
```

### Step 4: Install MCP Server Tools

```bash
# Install uv (for Gmail MCP server)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or on macOS
brew install uv

# Test Gmail MCP server
uvx mcp-gsuite --help

# Test Asana MCP server (auto-installs via npx)
npx -y @roychri/mcp-server-asana --help
```

### Step 5: Restart Your Dev Server

```bash
npm run dev
```

---

## 🎨 Using the MCP Agent

### 1. Create a Workflow

1. Click **🤖 + MCP Agent** in the toolbar
2. A new orange node appears on the canvas

### 2. Connect Gmail (One-Click OAuth!)

1. Click on the MCP Agent node
2. Properties panel opens on the right
3. Scroll to **"Gmail Integration"**
4. Click **"Connect Gmail"** button
5. Browser opens → Google OAuth screen
6. Select your Gmail account
7. Click **"Allow"**
8. Redirected back → ✅ Gmail Connected!

**That's it! No JSON files, no terminal commands!**

### 3. Configure the Agent

In the properties panel:

- **Label**: Name your agent (e.g., "Email to Tasks")
- **Model**: Choose Claude version
- **Agent Instructions**: Tell it what to do

#### Example Instructions:

```
Check my Gmail for unread emails from the last 24 hours.
For each email containing action items or tasks:
1. Create an Asana task in the "Inbox" project
2. Use the email subject as the task name
3. Add the sender and key points to task description
4. Set priority based on keywords (urgent, important, etc.)
5. Reply to the email confirming task creation
```

### 4. Execute Your Workflow

1. Click **▶️ Execute** in the toolbar
2. Watch the agent work in real-time
3. View results in the execution modal

---

## 🛠️ Available Tools

When connected, your agent automatically gets access to:

### Gmail Tools (~10+ tools)

- Search emails with filters
- Read email content and metadata
- Send new emails
- Create and manage drafts
- Mark emails as read/unread
- Get email attachments
- Manage labels
- Access calendar events

### Asana Tools (~20+ tools)

- Create tasks
- Update task details
- Search for tasks
- Manage projects
- Set task dependencies
- Create subtasks
- Add/remove followers
- Set due dates
- Manage custom fields
- And more!

---

## 💡 Example Workflows

### 1. Email Triage Bot

```
Review my unread Gmail emails.
Categorize each as: urgent, important, or FYI.
Create Asana tasks for urgent and important emails.
Archive FYI emails with label "Read Later".
Send me a summary email of actions taken.
```

### 2. Daily Standup Generator

```
Get my Asana tasks due today and in progress.
Check my Gmail calendar for meetings today.
Draft an email with my daily standup:
- What I'm working on (from Asana)
- What's blocking me (overdue tasks)
- What meetings I have (from calendar)
Send to team@company.com
```

### 3. Project Status Reporter

```
Get all tasks from Asana project "Q1 Launch".
Calculate completion percentage and identify blockers.
List overdue tasks and their assignees.
Draft a status email with this summary.
Send to stakeholders@company.com
```

### 4. Meeting Follow-Up

```
Check Gmail for calendar invites from today.
For each meeting:
- Create an Asana task for meeting notes
- Create a follow-up task due tomorrow
- Email attendees with task links
```

---

## 🔒 Security & Privacy

### Data Storage

- Gmail tokens: Stored encrypted in Supabase
- Asana tokens: Environment variables (server-only)
- No email content stored permanently
- Execution logs: Optional, deleted after 24 hours

### User Control

- Users can disconnect Gmail anytime
- OAuth can be revoked from Google Account settings
- RLS policies prevent users from seeing each other's data
- All API calls authenticated per-user

### Best Practices

1. Use environment variables for sensitive data
2. Never commit `.env.local` to git (already in `.gitignore`)
3. Rotate Asana tokens every 90 days
4. Monitor OAuth consent screen in Google Cloud
5. Review workflow executions regularly

---

## 🐛 Troubleshooting

### Gmail Connection Fails

**Symptoms**: "Connect Gmail" button doesn't work or returns error

**Solutions**:

1. Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are in `.env.local`
2. Verify redirect URI in Google Cloud Console: `http://localhost:3000/api/integrations/gmail/callback`
3. Ensure Gmail API is enabled in Google Cloud
4. Check `NEXT_PUBLIC_APP_URL=http://localhost:3000` in `.env.local`
5. Restart dev server after changing environment variables

### Asana Tools Not Available

**Symptoms**: Agent can't create tasks or access Asana

**Solutions**:

1. Verify `ASANA_ACCESS_TOKEN` is set in `.env.local`
2. Check token is valid in Asana Settings → Apps
3. Ensure token has workspace access
4. Restart dev server

### Agent Doesn't Call Tools

**Symptoms**: Agent responds with text but doesn't use Gmail/Asana

**Solutions**:

1. Make instructions more explicit ("Use Gmail to..." instead of "Check emails...")
2. Increase `maxIterations` if task is complex
3. Check both integrations are connected (green checkmarks)
4. Verify tools are discovered (check console logs)
5. Try simpler instructions first

### Execution Timeout

**Symptoms**: Workflow hangs or times out

**Solutions**:

1. Reduce scope of task (break into multiple agents)
2. Increase `maxTokens` limit
3. Check MCP servers are responsive (`uvx mcp-gsuite`, `npx @roychri/mcp-server-asana`)
4. Review console logs for errors

---

## 📚 Additional Resources

- [Model Context Protocol Docs](https://modelcontextprotocol.io/)
- [Gmail MCP Server](https://github.com/markuspfundstein/mcp-gsuite)
- [Asana MCP Server](https://github.com/roychri/mcp-server-asana)
- [Anthropic Tool Use Guide](https://docs.anthropic.com/claude/docs/tool-use)
- [MCP Server Registry](https://mcpmarket.com/)

---

## 🎉 You're Ready!

Your workflow automation builder is now fully set up!

Try creating your first automation workflow:

1. Add an MCP Agent node
2. Connect Gmail
3. Write simple instructions
4. Execute and watch the magic happen! ✨

**Questions?** Check the troubleshooting section or review console logs for details.
