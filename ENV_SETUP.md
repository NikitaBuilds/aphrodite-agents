# Environment Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenAI API Key (required for OpenAI models)
# Get your API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic API Key (required for Claude models)
# Get your API key from https://console.anthropic.com
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Upstash Redis (for workflow state management)
# Get your credentials from https://console.upstash.com
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token_here

# Supabase (for vector search)
# Get your credentials from https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Getting an OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and add it to your `.env.local` file

## Getting an Anthropic API Key

1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Sign in or create an account
3. Navigate to "API Keys" section
4. Click "Create Key"
5. Copy the key and add it to your `.env.local` file

## Getting Upstash Redis Credentials

1. Go to [https://console.upstash.com](https://console.upstash.com)
2. Sign up or log in (free tier available - perfect for this use case!)
3. Click "Create Database"
4. Choose "Redis" and select a region close to you
5. After creation, go to the database dashboard
6. Copy the "UPSTASH_REDIS_REST_URL" and "UPSTASH_REDIS_REST_TOKEN"
7. Paste both into your `.env.local` file

**Why Upstash Redis?**

- Stores temporary workflow execution data
- Passes context between nodes
- TTL auto-cleanup (1 hour)
- Serverless-friendly
- Free tier is generous

## Important Notes

- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore`
- You need at least one LLM provider (OpenAI or Anthropic) for the workflows to function
- Upstash Redis is required for workflow context passing between nodes
- Supabase credentials are required for vector search nodes
