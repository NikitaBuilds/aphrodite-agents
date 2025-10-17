-- ============================================================================
-- WORKFLOW AUTOMATION BUILDER - DATABASE MIGRATION
-- ============================================================================
-- This migration sets up the database schema for a workflow automation tool
-- focused on email drafting and task management automation
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  -- Primary key (references auth.users)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- User info
  email TEXT,
  full_name TEXT,
  
  -- ========================================
  -- MCP INTEGRATIONS
  -- ========================================
  
  -- Gmail OAuth Integration
  gmail_connected BOOLEAN DEFAULT FALSE,
  gmail_email TEXT,
  gmail_access_token TEXT,
  gmail_refresh_token TEXT,
  gmail_token_expiry TIMESTAMPTZ,
  
  -- Asana Integration
  asana_connected BOOLEAN DEFAULT FALSE,
  asana_access_token TEXT,
  asana_refresh_token TEXT,
  asana_token_expiry TIMESTAMPTZ,
  asana_workspace_id TEXT,
  asana_user_id TEXT
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- MCP integration indexes (for efficient queries)
CREATE INDEX IF NOT EXISTS idx_profiles_gmail_connected ON profiles(gmail_connected) WHERE gmail_connected = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_asana_connected ON profiles(asana_connected) WHERE asana_connected = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger, but good to have)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- WORKFLOWS TABLE (for saving/loading workflows)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_executed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_updated_at ON workflows(updated_at DESC);

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workflows"
  ON workflows FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- WORKFLOW EXECUTIONS TABLE (for execution history/logs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running', -- running, completed, failed
  results JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_executions_started_at ON workflow_executions(started_at DESC);

ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own execution history"
  ON workflow_executions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles with MCP integration credentials for workflow automation';
COMMENT ON COLUMN profiles.gmail_connected IS 'Whether user has connected Gmail via browser OAuth';
COMMENT ON COLUMN profiles.gmail_email IS 'Connected Gmail email address';
COMMENT ON COLUMN profiles.gmail_access_token IS 'OAuth access token for Gmail API';
COMMENT ON COLUMN profiles.gmail_refresh_token IS 'OAuth refresh token for Gmail API';
COMMENT ON COLUMN profiles.gmail_token_expiry IS 'When the Gmail access token expires';
COMMENT ON COLUMN profiles.asana_connected IS 'Whether user has connected Asana';
COMMENT ON COLUMN profiles.asana_access_token IS 'Asana personal access token';

COMMENT ON TABLE workflows IS 'Saved workflow configurations (nodes and edges)';
COMMENT ON TABLE workflow_executions IS 'Execution history and results for workflows';

-- ============================================================================
-- COMPLETE!
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Workflow Automation Builder database schema created successfully!';
  RAISE NOTICE '📋 Tables created: profiles, workflows, workflow_executions';
  RAISE NOTICE '🔒 Row Level Security enabled on all tables';
  RAISE NOTICE '🔧 MCP integrations ready: Gmail (OAuth), Asana (token-based)';
  RAISE NOTICE '';
  RAISE NOTICE '⚙️  NEXT STEP: Configure Supabase Auth settings:';
  RAISE NOTICE '   1. Go to Authentication → Settings';
  RAISE NOTICE '   2. Disable email confirmations (for faster testing)';
  RAISE NOTICE '   3. Set site URL to http://localhost:3000';
END $$;

