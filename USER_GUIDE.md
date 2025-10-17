# AI Agent Builder - User Guide

## Getting Started

The AI Agent Builder is a visual workflow tool for creating agent pipelines that generate optimized social media scripts.

## Workflow Overview

### 1. Adding Nodes

**Toolbar** (top-left corner):

- **🤖 Add LLM Node** - Creates an AI agent node (purple)
- **📊 Add Supabase Node** - Creates a data source node (green)
- **✨ Auto Layout** - Automatically organizes all nodes

Click to add nodes or apply automatic layout using the ELK hierarchical algorithm.

### 2. Editing Nodes

**To edit a node:**

1. Click on any node in the canvas
2. The **Properties Panel** slides in from the right
3. Edit the node's properties:

**LLM Node Properties:**

- **Label** - Display name for the node
- **Model** - Select AI model (GPT-4, Claude, etc.)
- **Prompt** - Instructions for the AI

**Supabase Node Properties:**

- **Label** - Display name for the node
- **Table** - Database table name
- **Query** - SQL query to execute

4. Changes are **saved automatically** as you type
5. Close the panel by clicking × or clicking outside

### 3. Visual Feedback

**Node States:**

- **Normal** - Default border color (purple for LLM, green for Supabase)
- **Selected** - Blue border with enhanced shadow
- **Hover** - Slightly elevated appearance

### 4. Connecting Nodes

**Creating Connections:**

1. Click and drag from a node's **output handle** (bottom circle)
2. Connect to another node's **input handle** (top circle)
3. Release to create the connection

**Connection Types:**

- Regular connections show as lines
- You can animate connections for data flow visualization

### 5. Canvas Navigation

**Built-in Controls:**

- **Pan** - Click and drag on empty canvas
- **Zoom** - Use mouse wheel or pinch gesture
- **Minimap** (bottom-right) - Overview of entire workflow
- **Controls** (bottom-left) - Zoom in/out, fit view buttons

### 6. Moving Nodes

1. Click and hold on a node
2. Drag to desired position
3. Release to drop

## Tips & Tricks

### Workflow Best Practices

1. **Start with Data Sources** - Begin with Supabase nodes that fetch data
2. **Add Processing** - Connect to LLM nodes for AI processing
3. **Chain Operations** - Create multi-step workflows by connecting multiple nodes
4. **Use Auto Layout** - Click "✨ Auto Layout" after adding nodes for clean organization
5. **Clear Naming** - Use descriptive labels for easier workflow understanding

### Keyboard Shortcuts

- **Delete/Backspace** - Delete selected connection (click edge first)
- **Mouse Wheel** - Zoom in/out
- **Click + Drag** - Pan canvas or move nodes

### Example Workflow

Here's a typical workflow structure:

```
[User Data Source] → [Content Generator] → [Script Optimizer]
     (Supabase)           (LLM GPT-4)          (LLM GPT-4)
```

1. **User Data Source** - Fetches user preferences from database
2. **Content Generator** - Creates initial script based on data
3. **Script Optimizer** - Refines script for maximum engagement

## Node Details

### LLM Node (Purple)

Represents an AI agent that processes data.

**Use cases:**

- Generate content
- Analyze sentiment
- Transform data
- Create summaries
- Optimize text

### Supabase Node (Green)

Represents a data source from your Supabase database.

**Use cases:**

- Fetch user data
- Retrieve content templates
- Load historical data
- Query analytics

## Technical Notes

- All changes are stored in browser memory
- Workflows reset on page refresh (save/load coming soon)
- Nodes can have multiple inputs and outputs
- Connection validation is automatic
