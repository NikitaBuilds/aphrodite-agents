# AI Agent Builder - Setup Guide

## Overview

A Next.js-based AI agent builder for creating visual workflows that generate optimized social media scripts.

## Tech Stack

- **Next.js 15** with App Router
- **React Flow** (@xyflow/react) for node-based UI
- **ELK.js** (elkjs) for automatic graph layout
- **TypeScript** for type safety
- **Tailwind CSS** for styling

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main entry point
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── FlowBuilder.tsx       # Main flow canvas component
│   ├── Toolbar.tsx           # Node creation toolbar
│   ├── PropertiesPanel.tsx   # Node editing side panel
│   └── nodes/
│       ├── LLMNode.tsx       # LLM agent node
│       └── SupabaseNode.tsx  # Data source node
├── types/
│   └── nodes.ts              # TypeScript type definitions
└── utils/
    └── layout.ts             # ELK layout utility
```

## Node Types

### LLM Node

- Represents an AI agent/LLM in the workflow
- Properties:
  - `label`: Display name
  - `model`: AI model (e.g., 'gpt-4')
  - `prompt`: Instructions for the LLM
- Color: Purple (#8b5cf6)

### Supabase Node

- Represents a data source from Supabase
- Properties:
  - `label`: Display name
  - `table`: Database table name
  - `query`: SQL query
- Color: Green (#10b981)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the agent builder.

## Features

✅ **Visual Workflow Builder**: Drag-and-drop interface for creating agent workflows
✅ **Custom Node Types**: LLM and Supabase data source nodes
✅ **Interactive Canvas**: Pan, zoom, and navigate with minimap
✅ **Dynamic Connections**: Connect nodes to create data flows
✅ **Add Nodes**: Toolbar for adding new nodes on the fly
✅ **Live Node Editing**: Click any node to edit its properties in real-time
✅ **Properties Panel**: Side panel with forms for editing node data
✅ **Auto-save**: Changes are saved automatically as you type
✅ **Auto Layout**: Automatic hierarchical layout using ELK.js algorithm
✅ **Smart Positioning**: Nodes are automatically organized on load and on-demand
✅ **Workflow Execution**: Execute workflows and call real LLM APIs
✅ **Visual Execution Status**: See which nodes are executing in real-time
✅ **Results Modal**: Beautiful dialog showing execution results with copy functionality
✅ **Professional Status Indicators**: ReactFlow's NodeStatusIndicator with spinning borders and overlays
✅ **Context Passing**: Nodes can reference outputs from previous nodes
✅ **Visual Output Picker**: Click-to-insert interface for adding previous node outputs
✅ **Upstash Redis Store**: Serverless workflow state management with auto-cleanup
✅ **Structured Field Access**: Access specific fields from structured outputs

## Usage

1. **Add Nodes**: Click "🤖 Add LLM Node" or "📝 Add Formatter" in the toolbar
2. **Auto Layout**: Click "✨ Auto Layout" to automatically organize nodes
3. **Edit Nodes**: Click on any node to open the properties panel
   - For LLM nodes: Edit label, model, prompt, and structured output
   - Enable structured output and define JSON schema
   - Use the **"+ Insert Previous Output"** button to add context from previous nodes
4. **Connect Nodes**: Drag from output handle (bottom) to input handle (top)
5. **Add Context**: Click "+ Insert Previous Output" to:
   - See all available nodes
   - Preview structured fields
   - Click to insert at cursor position
   - Access full output or specific fields
6. **Execute Workflow**: Click "▶️ Execute" to run the workflow
   - Watch nodes show spinning borders during execution
   - Green borders indicate successful completion
   - Red borders indicate errors
   - Results appear in a beautiful modal dialog
   - Copy final result with one click
7. **Move Nodes**: Click and drag nodes to reposition
8. **Close Properties**: Click the × or click outside the node
9. **Delete Connections**: Click on edge and press Delete/Backspace

## Next Steps

- [x] Add node editing panel for customizing properties ✅
- [x] Implement automatic layout with ELK.js ✅
- [ ] Implement node execution/testing
- [ ] Add more node types (API calls, transformers, etc.)
- [ ] Add delete node functionality
- [ ] Save/load workflows to/from JSON
- [ ] Export workflows as code
- [ ] Add validation for node connections
- [ ] Implement undo/redo functionality
- [ ] Add custom layout options (horizontal, radial, etc.)
