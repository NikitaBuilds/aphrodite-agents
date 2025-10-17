# 🚀 Workflow System - Complete Explanation

## Overview

The workflow system is a visual, node-based AI agent builder that lets you create complex content generation pipelines by connecting different types of processing nodes. Think of it like building a flowchart where each step can be an LLM call, a database query, or a vector search.

---

## 🧩 Node Types

### 1. **LLM Node** (Purple)

- **Purpose**: Process text with AI models (OpenAI or Anthropic)
- **Capabilities**:
  - Generate content using prompts
  - Support for **all major models** (GPT-5, Claude Sonnet 4.5, etc.)
  - **Structured output** via JSON schemas
  - Context injection from previous nodes
  - User data injection via templates

**Example Use Cases**:

- Generate social media scripts
- Analyze content
- Transform data formats
- Create personalized content

### 2. **Vector Search Node** (Cyan)

- **Purpose**: Find similar content using semantic search
- **Capabilities**:
  - Search through video embeddings
  - Filter by content type (spoken, visual, music)
  - Configurable match threshold and result count
  - Multiple search functions (general, musical, top videos)

**Example Use Cases**:

- Find trending videos on a topic
- Retrieve examples matching a theme
- Source inspiration content
- Research competitor content

### 3. **Supabase Node** (Green) - _[If you have it]_

- **Purpose**: Query databases directly
- **Capabilities**:
  - Run SQL queries
  - Fetch user data
  - Access custom tables

---

## 🔄 How Data Flows Through Workflows

### Step-by-Step Execution Flow

```
1. User clicks "▶ Execute Workflow"
   ↓
2. System detects workflow structure (start node → end node)
   ↓
3. Topological sort determines execution order
   ↓
4. Execute nodes sequentially:
   - Node 1: Runs → Stores output in Redis
   - Node 2: Reads Node 1 output → Processes → Stores output
   - Node 3: Reads Node 1 & 2 outputs → Processes → Stores output
   ↓
5. Results displayed in modal with all node outputs
```

### Data Storage (Redis)

- **Temporary storage**: All node outputs stored for 1 hour
- **Key format**: `workflow:{workflowId}:node:{nodeId}`
- **Auto-cleanup**: TTL ensures no stale data
- **Fast access**: O(1) lookups for any node output

---

## 🎯 Template Variable System

The most powerful feature! Templates let you inject data into prompts dynamically.

### 1. **Node Output Templates**

Reference outputs from previous nodes in the workflow:

**Syntax**: `{{node:nodeId}}` or `{{node:nodeId.fieldName}}`

**Examples**:

```
{{node:node_1}}                    → Full output from node_1
{{node:vectorSearch_1.videos}}     → Just the "videos" field
{{node:llm_1.hook}}                → Just the "hook" field from structured output
```

**Real Workflow Example**:

```
Node 1 (Vector Search): Find trending videos
  ↓ Outputs: { "videos": [...], "count": 5 }

Node 2 (LLM): Create script
  Prompt: "Create a script inspired by these videos: {{node:node_1.videos}}"
  ↓ The template is replaced with actual video data!
```

### 2. **User Data Templates**

Access data about the current user:

**Syntax**: `{{user:fieldName}}`

**Available Fields**:

- `{{user:full_name}}` - User's full name
- `{{user:creator_type}}` - fitness, tech, lifestyle, etc.
- `{{user:core_interests}}` - Their interests/topics
- `{{user:content_type}}` - short-form, long-form, etc.
- `{{user:speaking_or_visual}}` - speaking or visual style
- `{{user:mission_statement}}` - Their content mission
- `{{user:ai_brand_summary}}` - AI-generated brand summary
- `{{user:tone}}` - Content tone (casual, professional, etc.)
- `{{user:demographic}}` - Target audience

**Real Example**:

```
Prompt: "Create a {{user:content_type}} script for {{user:full_name}},
         a {{user:creator_type}} creator. Their mission is:
         {{user:mission_statement}}. Make it {{user:tone}}."
```

This automatically becomes:

```
"Create a short-form script for Alex Johnson,
 a fitness creator. Their mission is:
 Help people achieve their fitness goals through simple, science-based advice.
 Make it casual."
```

### 3. **Combined Templates**

Mix both types for maximum power:

```
Prompt: "Analyze these trending videos {{node:vectorSearch_1.videos}}
         and create a script for {{user:full_name}} that fits their
         {{user:creator_type}} niche and {{user:tone}} style."
```

---

## 📦 JSON Import/Export System

This is what makes workflows shareable and reusable!

### Workflow JSON Structure

```json
{
  "nodes": [
    {
      "id": "vectorSearch_1",
      "type": "vectorSearch",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Find Trending Videos",
        "functionName": "match_videos",
        "queryText": "{{user:core_interests}}",
        "matchThreshold": 0.3,
        "matchCount": 5
      }
    },
    {
      "id": "llm_1",
      "type": "llm",
      "position": { "x": 400, "y": 100 },
      "data": {
        "label": "Generate Script",
        "model": "claude-sonnet-4-5-20250929",
        "prompt": "Create a script inspired by: {{node:vectorSearch_1.videos}}",
        "useStructuredOutput": true,
        "outputSchema": "{\"type\":\"object\",\"properties\":{\"hook\":{\"type\":\"string\"}...}}"
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "vectorSearch_1",
      "target": "llm_1"
    }
  ],
  "exportedAt": "2025-01-10T12:00:00Z"
}
```

### Export Process

1. Click "💾 Export Workflow" button
2. System captures:
   - All node configurations (prompts, models, settings)
   - Node positions (for visual layout)
   - All connections between nodes
   - Metadata (export timestamp)
3. Downloads as `workflow_{timestamp}.json`

### Import Process

1. Click "📥 Import Workflow" button
2. Select a `.json` file
3. System:
   - Validates the JSON structure
   - Recreates all nodes with exact configurations
   - Restores all connections
   - Positions nodes on the canvas
   - **Templates remain intact** - they'll work for ANY user!

### Why This is Powerful

**Scenario 1: Template Reusability**

```
You create a workflow:
  "Generate content for {{user:creator_type}} about {{user:core_interests}}"

Someone else imports it:
  - Their user data automatically fills in
  - Same workflow, personalized to them!
```

**Scenario 2: Team Collaboration**

```
Marketer creates workflow → Exports JSON
  ↓
Designer imports → Tests with their data
  ↓
Developer imports → Integrates into production
```

**Scenario 3: Workflow Library**

```
Build a library of tested workflows:
- "trending_video_script.json"
- "competitor_analysis.json"
- "content_ideation.json"

Import whichever you need!
```

---

## 🔧 How Structured Output Works

### OpenAI Models (GPT-4o, GPT-5, etc.)

- Uses **native structured output** with Zod schemas
- Most reliable and type-safe
- Automatic validation

### Anthropic Models (Claude Sonnet, Opus, etc.)

- Uses **JSON mode** via OpenAI compatibility layer
- Schema included in system prompt
- Automatic markdown stripping (removes ```json blocks)
- Parses cleaned JSON

### Example Schema:

```json
{
  "type": "object",
  "properties": {
    "hook": {
      "type": "string",
      "description": "Attention-grabbing opening"
    },
    "mainContent": {
      "type": "string",
      "description": "Core message"
    },
    "hashtags": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["hook", "mainContent", "hashtags"]
}
```

**Output**:

```json
{
  "hook": "Nobody talks about this productivity hack...",
  "mainContent": "The 2-minute rule: If something takes...",
  "hashtags": ["#ProductivityHacks", "#TimeManagement"]
}
```

---

## 🎬 Real-World Example: Complete Workflow

### Goal: Generate personalized social media content

```
┌─────────────────────┐
│  Vector Search      │  Find 5 trending videos about {{user:core_interests}}
│  Node               │  Filter by content_type: {{user:content_type}}
└──────────┬──────────┘
           │ Outputs: { videos: [...], count: 5 }
           ↓
┌─────────────────────┐
│  LLM Node 1         │  Prompt: "Analyze these videos and identify
│  (Analyzer)         │  3 trending themes: {{node:vectorSearch_1.videos}}"
└──────────┬──────────┘  Model: Claude Sonnet 4.5
           │ Outputs: { themes: ["theme1", "theme2", "theme3"] }
           ↓
┌─────────────────────┐
│  LLM Node 2         │  Prompt: "Create a {{user:content_type}} script
│  (Script Writer)    │  for {{user:full_name}} ({{user:creator_type}} creator)
└─────────────────────┘  about these themes: {{node:llm_1.themes}}
                         Use {{user:tone}} tone and include their mission:
                         {{user:mission_statement}}"

                         Model: GPT-5
                         Structured Output: { hook, mainContent, callToAction, hashtags }
```

### What Happens When You Execute:

1. **Vector Search runs** → Searches for videos matching user's interests
2. **LLM Analyzer runs** → Reads video data, identifies themes
3. **Script Writer runs** → Gets themes + user data, generates personalized script
4. **All outputs saved** → Can be viewed, downloaded, or used in further processing

### When Someone Else Imports This:

- Same 3-node structure
- Same logic flow
- **Different user data** automatically injected
- Personalized for them without any changes!

---

## 💡 Best Practices

### 1. **Use Descriptive Labels**

```
✅ "Find Top Fitness Videos"
❌ "Vector Search 1"
```

### 2. **Structure Your Workflows**

```
Data Gathering → Analysis → Content Generation → Formatting
```

### 3. **Leverage Structured Output**

```
Instead of: "Generate a script with a hook, content, and CTA"
Use schema: { hook: string, mainContent: string, callToAction: string }
Then reference: {{node:scriptNode.hook}}
```

### 4. **Template Everything**

```
✅ "Create content for {{user:creator_type}} about {{user:core_interests}}"
❌ "Create content for a fitness creator about nutrition"
```

### 5. **Test with Different Users**

- Export your workflow
- Import with different user accounts
- Verify templates work universally

---

## 🔐 Security & Privacy

- **User data** is only accessible during execution
- **Node outputs** auto-delete after 1 hour
- **Workflows** contain templates, not actual data
- **Sharing workflows** = sharing logic, not personal info

---

## 🚀 Getting Started

1. **Create nodes**: Click "+ LLM Node" or "+ Vector Search"
2. **Connect them**: Drag from one node's handle to another
3. **Configure**: Click a node to set prompts, models, settings
4. **Add templates**: Use `{{node:id}}` and `{{user:field}}` syntax
5. **Test**: Select a user, click "▶ Execute Workflow"
6. **Export**: Share your workflow as JSON
7. **Import**: Load workflows created by others

---

## 📚 Summary

**Workflows** = Visual AI pipelines
**Nodes** = Processing steps (LLM, Vector Search, etc.)
**Templates** = Dynamic data injection (`{{node:id}}`, `{{user:field}}`)
**JSON Export** = Share complete workflows
**JSON Import** = Load and reuse workflows

The magic is in the templates - they make workflows universal and reusable while still being personalized for each user! 🎯

