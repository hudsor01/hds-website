-- Error logs table for application error monitoring
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Error classification
  level TEXT NOT NULL CHECK (level IN ('error', 'fatal')),
  error_type TEXT NOT NULL,
  fingerprint TEXT NOT NULL,

  -- Error details
  message TEXT NOT NULL,
  stack_trace TEXT,

  -- Request context
  url TEXT,
  method TEXT,
  route TEXT,
  request_id TEXT,

  -- User context (optional)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,

  -- Environment
  environment TEXT NOT NULL DEFAULT 'production',
  vercel_region TEXT,

  -- Flexible metadata
  metadata JSONB DEFAULT '{}',

  -- Resolution tracking
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT
);

-- Indexes for common query patterns
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_fingerprint ON error_logs(fingerprint);
CREATE INDEX idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_level ON error_logs(level);
CREATE INDEX idx_error_logs_route ON error_logs(route);
CREATE INDEX idx_error_logs_unresolved ON error_logs(created_at DESC) WHERE resolved_at IS NULL;

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can insert (used by logger)
CREATE POLICY "Service role can insert errors"
  ON error_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Service role can read all (used by admin API)
CREATE POLICY "Service role can read errors"
  ON error_logs FOR SELECT
  TO service_role
  USING (true);

-- Policy: Service role can update (mark resolved)
CREATE POLICY "Service role can update errors"
  ON error_logs FOR UPDATE
  TO service_role
  USING (true);

-- Comment for documentation
COMMENT ON TABLE error_logs IS 'Application error logs for monitoring and debugging';
COMMENT ON COLUMN error_logs.fingerprint IS 'Hash of error_type + message + first stack frame for grouping identical errors';
