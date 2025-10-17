# Structured Output Guide

## Overview

The AI Agent Builder supports **OpenAI's Structured Output** feature, allowing you to define JSON schemas that the LLM must follow when generating responses. This ensures consistent, predictable outputs perfect for social media content generation.

## How It Works

### 1. Enable Structured Output

When editing an LLM node in the Properties Panel:

1. Click on the node to open properties
2. Scroll down to the **"Use Structured Output"** checkbox
3. Toggle it **ON**
4. A JSON Schema editor will appear below

### 2. Define Your JSON Schema

The JSON Schema defines the exact structure of the LLM's response. Example for social media scripts:

```json
{
  "type": "object",
  "properties": {
    "hook": {
      "type": "string",
      "description": "Attention-grabbing opening line"
    },
    "mainContent": {
      "type": "string",
      "description": "Core message and value proposition"
    },
    "callToAction": {
      "type": "string",
      "description": "Clear next step for viewers"
    },
    "hashtags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "3-5 relevant hashtags"
    }
  },
  "required": ["hook", "mainContent", "callToAction", "hashtags"],
  "additionalProperties": false
}
```

### 3. Execute and Get Structured Results

When you execute the workflow:

1. The API sends your schema to OpenAI
2. OpenAI **guarantees** the response matches your schema
3. Results modal shows formatted JSON output
4. Copy button works with structured data

## Schema Properties

### Supported Types

- `string` - Text content
- `number` - Numeric values
- `boolean` - True/false
- `array` - Lists of items
- `object` - Nested structures
- `enum` - Predefined choices

### Schema Fields

- **`type`** - The data type (`object`, `string`, etc.)
- **`properties`** - Define each field in your output
- **`description`** - Helps the LLM understand what to generate
- **`required`** - Array of required field names
- **`additionalProperties`** - Set to `false` for strict schemas (required by OpenAI)

## Example Schemas

### Social Media Post

```json
{
  "type": "object",
  "properties": {
    "hook": { "type": "string" },
    "body": { "type": "string" },
    "cta": { "type": "string" },
    "hashtags": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["hook", "body", "cta"]
}
```

### Video Script

```json
{
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "sections": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "timestamp": { "type": "string" },
          "narration": { "type": "string" },
          "visualDescription": { "type": "string" }
        },
        "required": ["timestamp", "narration"]
      }
    },
    "duration": { "type": "number" }
  },
  "required": ["title", "sections"]
}
```

### Engagement Metrics Analysis

```json
{
  "type": "object",
  "properties": {
    "sentiment": {
      "type": "string",
      "enum": ["positive", "neutral", "negative"]
    },
    "viralityScore": { "type": "number" },
    "targetAudience": { "type": "string" },
    "suggestedImprovements": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["sentiment", "viralityScore"]
}
```

## Benefits

✅ **Guaranteed Structure** - LLM always returns valid JSON matching your schema
✅ **Type Safety** - Know exactly what fields you'll get
✅ **Easy Integration** - Structured output can be directly used by other systems
✅ **No Parsing Errors** - OpenAI validates the output before returning
✅ **Better Prompts** - Descriptions guide the LLM on what to generate

## Visual Indicators

When a node uses structured output:

- **Blue "Structured" badge** in the results modal
- **JSON formatted output** with syntax highlighting
- **Monospace font** for easy reading
- **Copy functionality** preserves JSON formatting

## Technical Details

### OpenAI API Integration

The system uses OpenAI's `chat.completions.parse()` with `zodResponseFormat`:

```typescript
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod/v3';

const StructuredOutput = z.object({
  hook: z.string().optional().nullable(),
  mainContent: z.string().optional().nullable(),
  // ... more fields
}).passthrough();

const completion = await openai.chat.completions.parse({
  model: 'gpt-4o-2024-08-06',
  messages: [...],
  response_format: zodResponseFormat(StructuredOutput, "structured_output"),
});

// Access parsed output
const result = completion.choices[0]?.message?.parsed;
```

### Supported Models

**Only these models support structured output:**

- `gpt-4o-2024-08-06` ✅ (Recommended)
- `gpt-4o-mini` ✅
- `gpt-4o` (latest version)

**These models do NOT support structured output:**

- `gpt-4` ❌
- `gpt-4-turbo` ❌
- `gpt-3.5-turbo` ❌

### Validation

- Input schemas are validated before sending to OpenAI
- Invalid JSON schemas will throw errors during execution
- Output is automatically parsed and displayed as formatted JSON

## Best Practices

1. **Keep schemas simple** - Complex nested structures may be harder for LLMs
2. **Use descriptions** - Help the LLM understand what each field should contain
3. **Set required fields** - Only mark truly essential fields as required
4. **Test incrementally** - Start with simple schemas and add complexity
5. **Use enums** - For fields with predefined options
6. **Use `.nullable()` with `.optional()`** - OpenAI requires optional fields to also be nullable

## Troubleshooting

**Schema Parse Error:**

- Check your JSON syntax (commas, quotes, brackets)
- Use a JSON validator to verify your schema

**LLM Doesn't Follow Schema:**

- Add more detailed `description` fields
- Simplify your schema
- Check that you're using a compatible model (GPT-4 recommended)

**No Output:**

- Ensure `useStructuredOutput` is checked
- Verify your schema has at least one required field
- Check API key is configured correctly
