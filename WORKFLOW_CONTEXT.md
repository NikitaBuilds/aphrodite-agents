# Workflow Context & State Management

## Overview

The AI Agent Builder uses **Upstash Redis** for serverless workflow state management, enabling nodes to pass context and data to subsequent nodes in a workflow.

## How It Works

### 1. Workflow Execution

When you click "Execute":

1. A unique `workflowId` is generated
2. Each node executes in sequence
3. Node outputs are stored in Redis with 1-hour TTL
4. Subsequent nodes can reference previous outputs

### 2. Context Injection

**Visual Pickers for Context:**

The Properties Panel provides two visual pickers for adding dynamic context:

#### 1. Insert Previous Output (Purple Button)

Insert outputs from previous nodes in the workflow:

1. Click **"+ Insert Previous Output"**
2. See all previous nodes with their IDs and labels
3. Click a node to see available options:
   - **📦 Full Output** - Complete node output
   - **🔹 Structured Fields** - Specific fields (if structured output enabled)
4. Click any option → Template inserted at cursor

**Templates:** `{{node:NODE_ID}}` or `{{node:NODE_ID.FIELD}}`

#### 2. Insert Data Source (Green Button)

Insert user data or external data sources:

1. Click **"+ Insert Data Source"**
2. See available data sources:
   - **👤 User Data** - Current user being processed
   - **📊 Supabase Tables** _(Coming soon)_
3. Click a source to see all available fields
4. Click any field → Template inserted at cursor

**Templates:** `{{user:FIELD}}` or `{{supabase:TABLE.COLUMN}}`

**Manual Template Syntax (still works):**

```
{{node:NODE_ID}}              - Full output from a node
{{node:NODE_ID.FIELD}}        - Specific field from structured output
{{user:FIELD}}                - User data field (name, email, role, etc.)
{{user:preferences.tone}}     - Nested user data
```

### Example Workflows

#### Example 1: User-Personalized Content

**Node 1: Personalized Script Generator**

**Prompt:**

```
Create a 30-second social media script about productivity for {{user:name}},
a {{user:role}} in the {{user:department}} department.

Consider their location: {{user:location}}
Their bio: {{user:bio}}
Preferred tone: {{user:preferences.tone}}
Preferred platform: {{user:preferences.platform}}

Make it highly personalized and relevant to their role.
```

When executed for **Alice Johnson** (Marketing Manager), the system replaces:

- `{{user:name}}` → "Alice Johnson"
- `{{user:role}}` → "Marketing Manager"
- `{{user:department}}` → "Marketing"
- And so on...

**Output (Structured):**

```json
{
  "hook": "Hey Alice! As a Marketing Manager, you know time is money...",
  "mainContent": "Here's how top marketers in San Francisco stay productive...",
  "callToAction": "Try this and let me know how it works for your team!",
  "hashtags": ["#MarketingProductivity", "#SFBusiness", "#LeadershipTips"]
}
```

#### Example 2: Multi-Node with Context

**Node 1: Generate Script**

```
Create a social media script about {{user:preferences.platform}} best practices
```

**Output:**

```json
{ "hook": "...", "mainContent": "...", "callToAction": "..." }
```

**Node 2: Evaluate & Improve**

```
Evaluate this script for {{user:name}}:

Script Hook: {{node:1.hook}}
Script Content: {{node:1.mainContent}}
CTA: {{node:1.callToAction}}

User's preferred tone is: {{user:preferences.tone}}
User's role: {{user:role}}

Provide a score and specific improvements to make it more engaging for their audience.
```

The system replaces BOTH node outputs AND user data automatically!

## Technical Architecture

### Redis Key Pattern

```
workflow:{workflowId}:node:{nodeId}    - Node output data
workflow:{workflowId}:meta              - Workflow metadata
```

### Data Structure

**Node Output:**

```typescript
{
  content: string | object,    // LLM output (raw or structured)
  model?: string,               // Model used
  tokens?: number,              // Tokens consumed
  isStructured?: boolean,       // Whether output is structured
  timestamp: number             // When created
}
```

### TTL (Time To Live)

- All workflow data expires after **1 hour**
- Automatic cleanup - no manual deletion needed
- Perfect for temporary execution state

## API Integration

### FlowBuilder → API Route

1. FlowBuilder generates `workflowId`
2. Sends `workflowId` with each node execution request
3. API route fetches previous outputs: `getAllNodeOutputs(workflowId)`
4. Injects context into prompt: `injectNodeOutputs(prompt, outputs)`
5. Stores result: `setNodeOutput(workflowId, nodeId, output)`

### Workflow Store Functions

```typescript
// Store node output
await setNodeOutput(workflowId, nodeId, {
  content: "...",
  model: "gpt-4o",
  tokens: 150,
});

// Get single node output
const output = await getNodeOutput(workflowId, nodeId);

// Get all outputs for a workflow
const allOutputs = await getAllNodeOutputs(workflowId);

// Inject outputs into prompt
const processed = injectNodeOutputs("Evaluate: {{node:1}}", allOutputs);
```

## UI Features

### Properties Panel - Two Visual Pickers

**1. "+ Insert Previous Output" (Purple)**

- Lists all previous nodes in workflow
- Shows structured fields if available
- One-click insertion at cursor

**2. "+ Insert Data Source" (Green)**

- Lists available data sources
- Currently: User Data (9 fields)
- Future: Supabase tables, APIs, etc.
- Field descriptions and types shown
- Future-proof architecture

### Available User Data Fields

When you click **"+ Insert Data Source"** → **"👤 User Profile Data"**, you'll see all fields from the Supabase `profiles` table:

**Core Fields:**

- **id** - User's unique ID
- **creator_type** - Type of content creator
- **content_type** - Primary content type
- **speaking_or_visual** - Content style preference

**Brand & Content:**

- **mission_statement** - User's mission statement
- **core_interests** - Core interests and topics
- **ai_brand_summary** - AI-generated brand summary
- **product_name** - Product or brand name
- **seller** - What the user sells

**Preferences:**

- **music_genre** - Preferred music genre
- **filming_device** - Device used for filming
- **daily_post_commitment** - Daily posting commitment
- **gender** - User's gender
- **anything_else** - Additional information
- **whatsapp_number** - WhatsApp contact

**Platform Connections:**

- **instagram_connected** - Instagram connected (boolean)
- **tiktok_connected** - TikTok connected (boolean)
- **has_instagram_videos** - Has Instagram videos (boolean)
- **has_tiktok_videos** - Has TikTok videos (boolean)

### Example Use Cases

**1. Chain of Thought:**

```
Node 1: Generate ideas
Node 2: "Expand on these ideas: {{node:1}}"
Node 3: "Refine: {{node:2}}"
```

**2. Multi-Step Content Creation:**

```
Node 1: Create script with structured output
Node 2: "Write a catchy title for: {{node:1.mainContent}}"
Node 3: "Create hashtags that match: {{node:1}} and {{node:2}}"
```

**3. Evaluation & Iteration:**

```
Node 1: Generate content
Node 2: "Score this: {{node:1}}"
Node 3: "Improve based on: {{node:2}}"
```

## Benefits

✅ **Stateless Serverless** - No long-running processes  
✅ **Automatic Cleanup** - TTL handles old data  
✅ **Simple Syntax** - `{{node:id}}` is intuitive  
✅ **Structured Access** - Field-level extraction with `.field`  
✅ **Type-Safe** - Full TypeScript support  
✅ **Scalable** - Upstash handles scale automatically

## Configuration

### Required Environment Variables

```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed setup instructions.

## Limitations

- **Sequential Execution**: Nodes run in order (no parallel execution yet)
- **1-Hour TTL**: Workflow data expires after 1 hour
- **Single Workflow**: Each execution creates a new workflow ID
- **Node ID Reference**: Must know the node ID (shown in UI)

## Supabase Integration (Future)

The Data Source Picker is designed to be extensible. Future integration will:

### 1. Fetch Schema from Supabase

```typescript
const dataSources = [
  {
    id: "user",
    label: "User Data",
    fields: [...]  // Static for now
  },
  {
    id: "supabase_posts",
    label: "Posts Table",
    icon: "📊",
    templatePrefix: "supabase.posts",
    fields: await fetchSupabaseTableSchema("posts")
  }
];
```

### 2. Template Syntax

```
{{supabase:posts.title}}       - Column from posts table
{{supabase:users.metadata}}    - User metadata from DB
```

### 3. Runtime Resolution

During execution, the system will:

1. Parse template: `{{supabase:posts.title}}`
2. Query Supabase for the data
3. Inject result into prompt
4. Execute LLM with full context

### Architecture Benefits

✅ **Extensible** - Easy to add new data sources  
✅ **Type-safe** - Field types shown in picker  
✅ **Discoverable** - Users see what's available  
✅ **Consistent** - Same UX for all data sources

## Future Enhancements

- ✅ Visual node output picker (DONE)
- ✅ Visual data source picker (DONE)
- Autocomplete for template syntax
- Workflow persistence (save/load)
- Parallel node execution
- Workflow templates
- Context preview in properties panel
- Real-time Supabase schema fetching
- Custom data source plugins
