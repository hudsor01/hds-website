-- Create lead notes table for admin comments and activity tracking
CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES calculator_leads(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN ('note', 'status_change', 'email_sent', 'call', 'meeting')),
  content TEXT NOT NULL,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_created_at ON lead_notes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access (all operations allowed)
CREATE POLICY "Enable all operations for admins"
  ON lead_notes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add notes column to calculator_leads if it doesn't exist (for backward compatibility)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calculator_leads'
    AND column_name = 'notes'
  ) THEN
    ALTER TABLE calculator_leads ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Create function to automatically create status change notes
CREATE OR REPLACE FUNCTION track_lead_status_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Track contacted status change
  IF OLD.contacted = false AND NEW.contacted = true THEN
    INSERT INTO lead_notes (lead_id, note_type, content, metadata)
    VALUES (
      NEW.id,
      'status_change',
      'Lead marked as contacted',
      jsonb_build_object('field', 'contacted', 'old_value', false, 'new_value', true)
    );
  END IF;

  -- Track converted status change
  IF OLD.converted = false AND NEW.converted = true THEN
    INSERT INTO lead_notes (lead_id, note_type, content, metadata)
    VALUES (
      NEW.id,
      'status_change',
      CASE
        WHEN NEW.conversion_value IS NOT NULL THEN
          'Lead converted - Value: $' || NEW.conversion_value::TEXT
        ELSE
          'Lead marked as converted'
      END,
      jsonb_build_object('field', 'converted', 'old_value', false, 'new_value', true, 'conversion_value', NEW.conversion_value)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status change tracking
DROP TRIGGER IF EXISTS lead_status_change_trigger ON calculator_leads;
CREATE TRIGGER lead_status_change_trigger
  AFTER UPDATE ON calculator_leads
  FOR EACH ROW
  EXECUTE FUNCTION track_lead_status_changes();

-- Create initial notes for existing leads
INSERT INTO lead_notes (lead_id, note_type, content, created_at, metadata)
SELECT
  id,
  'status_change',
  'Lead created',
  created_at,
  jsonb_build_object(
    'calculator_type', calculator_type,
    'lead_score', lead_score,
    'lead_quality', lead_quality
  )
FROM calculator_leads
WHERE NOT EXISTS (
  SELECT 1 FROM lead_notes WHERE lead_notes.lead_id = calculator_leads.id
);
