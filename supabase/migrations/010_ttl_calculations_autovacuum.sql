-- Migration: TTL Calculations Autovacuum
-- Description: Creates a function and cron job to automatically clean up expired calculations

-- Create function to delete expired calculations
CREATE OR REPLACE FUNCTION cleanup_expired_ttl_calculations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM ttl_calculations
  WHERE expires_at IS NOT NULL
    AND expires_at < now();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Log cleanup activity (optional - can be removed if not needed)
  IF deleted_count > 0 THEN
    RAISE NOTICE 'Cleaned up % expired TTL calculations', deleted_count;
  END IF;

  RETURN deleted_count;
END;
$$;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION cleanup_expired_ttl_calculations() TO service_role;

-- Enable pg_cron extension (if not already enabled)
-- Note: This requires the extension to be enabled in Supabase dashboard
-- Dashboard > Database > Extensions > pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the cleanup to run daily at 3:00 AM UTC
-- This uses pg_cron which must be enabled in Supabase dashboard
SELECT cron.schedule(
  'cleanup-expired-ttl-calculations', -- job name
  '0 3 * * *',                        -- cron expression: daily at 3 AM UTC
  $$SELECT cleanup_expired_ttl_calculations()$$
);

-- Create index to optimize the cleanup query (if not exists)
CREATE INDEX IF NOT EXISTS idx_ttl_calculations_expires_at
  ON ttl_calculations(expires_at)
  WHERE expires_at IS NOT NULL;

-- Add comment documenting the cleanup job
COMMENT ON FUNCTION cleanup_expired_ttl_calculations() IS
  'Deletes TTL calculations that have passed their expiration date. Called automatically by pg_cron daily at 3 AM UTC.';
