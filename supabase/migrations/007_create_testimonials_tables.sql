-- Migration: Create testimonial system tables
-- Description: Tables for testimonial collection with private link support

-- Testimonial requests (for private unique links)
CREATE TABLE IF NOT EXISTS testimonial_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(64) UNIQUE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  project_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ
);

-- Create index for token lookups
CREATE INDEX idx_testimonial_requests_token ON testimonial_requests(token);
CREATE INDEX idx_testimonial_requests_expires ON testimonial_requests(expires_at);

-- Submitted testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES testimonial_requests(id) ON DELETE SET NULL,
  client_name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  role VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  content TEXT NOT NULL,
  photo_url VARCHAR(500),
  video_url VARCHAR(500),
  service_type VARCHAR(100),
  approved BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_testimonials_approved ON testimonials(approved);
CREATE INDEX idx_testimonials_featured ON testimonials(featured);
CREATE INDEX idx_testimonials_rating ON testimonials(rating);
CREATE INDEX idx_testimonials_created ON testimonials(created_at DESC);

-- Enable Row Level Security
ALTER TABLE testimonial_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for testimonial_requests
-- Public can read their own request by token (for submission form)
CREATE POLICY "Anyone can read request by token" ON testimonial_requests
  FOR SELECT USING (true);

-- Only authenticated users can insert/update (admin creating links)
CREATE POLICY "Authenticated users can manage requests" ON testimonial_requests
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for testimonials
-- Public can read approved testimonials
CREATE POLICY "Anyone can read approved testimonials" ON testimonials
  FOR SELECT USING (approved = true);

-- Public can submit testimonials (insert)
CREATE POLICY "Anyone can submit testimonials" ON testimonials
  FOR INSERT WITH CHECK (true);

-- Authenticated users can manage all testimonials
CREATE POLICY "Authenticated users can manage testimonials" ON testimonials
  FOR ALL USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_testimonials_updated_at();

-- Comments for documentation
COMMENT ON TABLE testimonial_requests IS 'Stores private testimonial request links sent to clients';
COMMENT ON TABLE testimonials IS 'Stores submitted testimonials with approval workflow';
COMMENT ON COLUMN testimonial_requests.token IS 'Unique token for private submission link';
COMMENT ON COLUMN testimonials.request_id IS 'Optional link to the request that generated this testimonial';
COMMENT ON COLUMN testimonials.service_type IS 'Type of service: web-development, saas-consulting, digital-marketing, etc.';
