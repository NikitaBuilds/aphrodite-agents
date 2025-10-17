# Multi-User Workflow Execution

## Overview

The AI Agent Builder supports executing workflows for **multiple users simultaneously**, generating personalized content for each user based on their unique data (role, department, preferences, etc.).

## How It Works

### 1. User Selection

The **User Table** (collapsible panel at bottom) allows you to:

- View all available users
- Select multiple users with checkboxes
- Click "Execute for Selected Users" button
- Execute the same workflow for all selected users in parallel

### 2. Parallel Execution

When you execute for multiple users:

1. **Workflow ID per User** - Each user gets their own `workflowId`
2. **Parallel Processing** - All users execute simultaneously
3. **Context Injection** - `{{user:field}}` templates replaced with actual user data
4. **Separate Results** - Each user's results stored independently

### 3. Results Display

The results modal automatically adapts based on execution type:

#### **Single User Execution**

- Clean, simple view
- Shows all nodes executed
- Final result highlighted
- One "Copy Result" button

#### **Multi-User Execution**

- **Tabbed Interface** - One tab per user
- **Tab Headers** show:
  - User name
  - Total tokens used
- **Per-User View** - Click any tab to see that user's complete results
- **Two Copy Options**:
  - "Copy {User}'s Result" - Copy active user's output
  - "Copy All Results" - Copy all users' outputs as JSON array

## Example Flow

### Setup

**Users Selected:**

- Alice Johnson (Marketing Manager)
- Bob Smith (Content Creator)
- Carol Davis (Social Media Specialist)

**Workflow:**

```
Node 1: Personalized Script Generator
Prompt: "Create a script for {{user:name}}, a {{user:role}}..."
```

### Execution

Click **"Execute for Selected Users (3)"**

**What Happens:**

1. 3 parallel workflow executions start
2. Each gets unique workflowId:
   - `workflow-alice-1234...`
   - `workflow-bob-1234...`
   - `workflow-carol-1234...`
3. Each prompt gets personalized:
   - Alice: "Create a script for Alice Johnson, a Marketing Manager..."
   - Bob: "Create a script for Bob Smith, a Content Creator..."
   - Carol: "Create a script for Carol Davis, a Social Media Specialist..."
4. All execute simultaneously
5. Results stored separately in Redis

### Results Modal

```
┌─────────────────────────────────────────────────────┐
│ Workflow Execution Results                          │
│ Results for 3 users                                 │
├─────────────────────────────────────────────────────┤
│ [Alice Johnson (150 tokens)] [Bob Smith (145)] [Carol] │
│  ^^^^ Active Tab                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Node: 1                    gpt-4o  Structured  150t │
│ ┌─────────────────────────────────────────────┐   │
│ │ {                                           │   │
│ │   "hook": "Hey Alice! As a Marketing...",  │   │
│ │   "mainContent": "...",                    │   │
│ │   "callToAction": "...",                   │   │
│ │   "hashtags": [...]                        │   │
│ │ }                                           │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ✨ Final Result for Alice Johnson                  │
│ ┌─────────────────────────────────────────────┐   │
│ │ [Same JSON output, highlighted]             │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ [Copy All Results (3)]   [Copy Alice's] [Close]   │
└─────────────────────────────────────────────────────┘
```

**Click "Bob Smith" tab** → See Bob's personalized results  
**Click "Carol Davis" tab** → See Carol's results

## Copy Functionality

### Copy Single User Result

- Button: "Copy {User Name}'s Result"
- Copies the final output for the active tab's user
- Perfect for using that specific user's content

### Copy All Results

- Button: "Copy All Results (N users)"
- Copies JSON array of all users' results:

```json
[
  {
    "user": "Alice Johnson",
    "result": {
      "hook": "...",
      "mainContent": "...",
      "callToAction": "...",
      "hashtags": [...]
    }
  },
  {
    "user": "Bob Smith",
    "result": { ... }
  },
  {
    "user": "Carol Davis",
    "result": { ... }
  }
]
```

Perfect for:

- Batch processing
- Importing into spreadsheets
- Bulk content scheduling
- Analytics

## Use Cases

### 1. Personalized Campaigns

**Scenario:** Create unique social media posts for each team member

**Workflow:**

```
Node 1: Generate personalized post for {{user:name}}
        Consider their {{user:role}} and {{user:preferences.platform}}
```

**Result:** Each user gets content tailored to their role and preferred platform

### 2. A/B Testing

**Scenario:** Compare outputs for different user personas

**Workflow:**

```
Select 2 users with different roles
Execute workflow
Switch between tabs to compare results
```

### 3. Bulk Content Generation

**Scenario:** Create 50 personalized scripts for your entire team

**Workflow:**

```
Select all 50 users
Execute once
Get 50 unique, personalized scripts
Copy all results
Import to your CMS
```

## Technical Details

### Data Structure

**Results Object:**

```typescript
{
  "alice-1": {
    content: {...},
    userName: "Alice Johnson",
    userId: "alice",
    tokens: 150
  },
  "bob-1": {
    content: {...},
    userName: "Bob Smith",
    userId: "bob",
    tokens: 145
  }
}
```

### Grouping Logic

Results are grouped by `userId`, extracted from the key pattern:

- Key: `${userId}-${nodeId}`
- Extract userId → Group results
- Show one tab per unique userId

### Tab State

- Default tab: First user in results
- Tabs show user name + token count
- Active tab highlighted
- Smooth transitions

## Benefits

✅ **Parallel Processing** - All users execute simultaneously  
✅ **Independent Results** - Each user's output separate  
✅ **Easy Comparison** - Switch tabs to compare  
✅ **Bulk Export** - Copy all results as JSON  
✅ **Token Tracking** - See cost per user  
✅ **Scalable** - Works for 1 or 100 users  
✅ **Professional UI** - Clean tabs with shadcn/ui

## Limitations

- **Memory**: Browser handles results for all users (should be fine for <100 users)
- **Sequential Display**: While execution is parallel, results show one user at a time
- **No Comparison View**: Can't see 2 users side-by-side (yet - future enhancement)

## Future Enhancements

- Side-by-side comparison view
- Export to CSV/Excel
- Filter/search within results
- Result analytics (avg tokens, success rate)
- Batch download as separate files
- Result history/persistence
