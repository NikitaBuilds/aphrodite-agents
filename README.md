# 🤖 Workflow Automation Builder

**Visual workflow builder for automating email and task management using AI agents with MCP (Model Context Protocol) integration.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## ✨ Features

- 🎨 **Visual Workflow Builder** - Drag-and-drop interface using ReactFlow
- 🤖 **MCP Agent Nodes** - AI agents with access to real-world tools
- 📧 **Gmail Integration** - Browser-based OAuth, no manual setup
- ✅ **Asana Integration** - Full task and project management
- 🔐 **Secure by Default** - Row-level security with Supabase
- ⚡ **Real-time Execution** - Watch agents work in real-time
- 💾 **Workflow Persistence** - Save and load your automations

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd aphrodite-agent-2
npm install
```

### 2. Set Up Environment

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:

- `ANTHROPIC_API_KEY` - Get from [Anthropic Console](https://console.anthropic.com/)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - See setup guide below
- `NEXT_PUBLIC_SUPABASE_URL` & keys - From your Supabase project
- `ASANA_ACCESS_TOKEN` - From Asana settings

**Detailed setup:** See `MCP_AGENT_SETUP.md`

### 3. Set Up Database

1. Create a new [Supabase](https://supabase.com/) project
2. Go to SQL Editor
3. Run the migration: `supabase-init-migration.sql`
4. Verify tables were created

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎯 How It Works

### Node Types

1. **LLM Node** (Purple)

   - Basic AI text generation
   - OpenAI or Anthropic models
   - Structured output support

2. **MCP Agent Node** (Orange) ⭐

   - AI agents with tool access
   - Connects to Gmail, Asana, etc.
   - Autonomous multi-step workflows
   - Dynamic tool discovery

3. **Supabase Node** (Green)
   - Query your database
   - Store/retrieve data
   - Inject data into workflows

### Example Workflow

```
1. User adds MCP Agent node
2. Connects Gmail via browser OAuth (one click!)
3. Writes instructions: "Read unread emails, create Asana tasks for action items"
4. Clicks Execute
5. Agent:
   - Discovers 20+ tools from Gmail & Asana
   - Reads emails autonomously
   - Creates tasks in Asana
   - Returns summary
```

---

## 📖 Documentation

- **[MCP_AGENT_SETUP.md](./MCP_AGENT_SETUP.md)** - Complete setup guide
- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Environment variables
- **[supabase-init-migration.sql](./supabase-init-migration.sql)** - Database schema

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           React Flow Canvas (UI)                │
│  ┌──────┐    ┌──────────┐    ┌──────────┐     │
│  │ LLM  │───→│   MCP    │───→│ Supabase │     │
│  │ Node │    │  Agent   │    │   Node   │     │
│  └──────┘    └──────────┘    └──────────┘     │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         Next.js API Routes (Backend)            │
│                                                  │
│  ┌──────────────┐    ┌─────────────────────┐  │
│  │ MCP Client   │───→│  Gmail MCP Server   │  │
│  │ (connects to)│    │  Asana MCP Server   │  │
│  └──────────────┘    └─────────────────────┘  │
│         ↓                                        │
│  ┌──────────────┐                               │
│  │  Anthropic   │  (Tool calling & reasoning)   │
│  │    Claude    │                               │
│  └──────────────┘                               │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│            External Services                     │
│  📧 Gmail API    ✅ Asana API                   │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, ReactFlow, TailwindCSS
- **Backend**: Next.js API Routes, Node.js
- **AI**: Anthropic Claude (with native tool calling)
- **MCP**: @modelcontextprotocol/sdk
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + OAuth 2.0
- **State**: Redis (workflow context)

---

## 🤝 Contributing

Contributions welcome! This project demonstrates:

- MCP integration patterns
- Browser-based OAuth flows
- Agentic AI workflows
- Visual programming interfaces

---

## 📄 License

MIT

---

## 🙏 Credits

Built with:

- [Model Context Protocol](https://modelcontextprotocol.io/) by Anthropic
- [ReactFlow](https://reactflow.dev/) for visual workflows
- [Supabase](https://supabase.com/) for backend
- [Next.js](https://nextjs.org/) by Vercel

---

**Ready to automate your workflow?** See `MCP_AGENT_SETUP.md` to get started! 🚀
