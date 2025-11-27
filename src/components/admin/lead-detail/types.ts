export interface Lead {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  calculator_type: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  lead_score: number;
  lead_quality: string;
  created_at: string;
  contacted: boolean;
  converted: boolean;
  contacted_at: string | null;
  converted_at: string | null;
  conversion_value: number | null;
  attribution: {
    source: string;
    medium: string;
    campaign: string | null;
    device_type: string | null;
    browser: string | null;
    referrer: string | null;
  } | null;
}

export interface Note {
  id: string;
  note_type: 'note' | 'status_change' | 'email_sent' | 'call' | 'meeting';
  content: string;
  created_by: string;
  created_at: string;
  metadata: Record<string, unknown>;
}
