-- TTL Calculator saved calculations table
-- Enables shareable links, email results, and usage analytics
-- Run: supabase db push

CREATE TABLE IF NOT EXISTS public.ttl_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Short shareable code (8 chars, URL-safe)
  share_code text UNIQUE NOT NULL,

  -- Calculation data (stored as JSONB for flexibility)
  inputs jsonb NOT NULL,
  results jsonb NOT NULL,

  -- Optional metadata
  name text,
  email text, -- If user wants results emailed

  -- Analytics (anonymous, no PII except optional email)
  county text, -- Denormalized for easy analytics queries
  purchase_price integer, -- Denormalized for analytics
  view_count integer DEFAULT 0,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  last_viewed_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '90 days'),

  -- Constraints
  CONSTRAINT valid_share_code CHECK (length(share_code) >= 6 AND share_code ~ '^[A-Za-z0-9]+$'),
  CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index for fast share code lookups
CREATE INDEX IF NOT EXISTS idx_ttl_calculations_share_code ON public.ttl_calculations(share_code);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_ttl_calculations_county ON public.ttl_calculations(county);
CREATE INDEX IF NOT EXISTS idx_ttl_calculations_created_at ON public.ttl_calculations(created_at DESC);

-- Index for cleanup of expired calculations
CREATE INDEX IF NOT EXISTS idx_ttl_calculations_expires_at ON public.ttl_calculations(expires_at) WHERE expires_at IS NOT NULL;

-- RLS: Allow anonymous inserts and reads (no auth required for calculator)
ALTER TABLE public.ttl_calculations ENABLE ROW LEVEL SECURITY;

-- Anyone can create calculations (anonymous tool)
CREATE POLICY "Anyone can create calculations" ON public.ttl_calculations
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read calculations by share_code (for sharing)
CREATE POLICY "Anyone can read calculations" ON public.ttl_calculations
  FOR SELECT TO anon, authenticated
  USING (true);

-- Only service role can update (for view count incrementing via API)
CREATE POLICY "Service role can update" ON public.ttl_calculations
  FOR UPDATE TO service_role
  USING (true);

-- Function to generate unique share codes
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Comment for documentation
COMMENT ON TABLE public.ttl_calculations IS 'Stores TTL calculator results for sharing and analytics. No authentication required.';
COMMENT ON COLUMN public.ttl_calculations.share_code IS 'Short URL-safe code for sharing (e.g., ABC123XY)';
COMMENT ON COLUMN public.ttl_calculations.inputs IS 'VehicleInputs JSON: purchasePrice, county, tradeInValue, etc.';
COMMENT ON COLUMN public.ttl_calculations.results IS 'CalculationResults JSON: ttlResults, paymentResults, tcoResults';
