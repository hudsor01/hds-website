-- Create case studies table
CREATE TABLE IF NOT EXISTS case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  project_type TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge TEXT NOT NULL,
  solution TEXT NOT NULL,
  results TEXT NOT NULL,
  technologies JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '[]'::jsonb,
  testimonial_text TEXT,
  testimonial_author TEXT,
  testimonial_role TEXT,
  testimonial_video_url TEXT,
  thumbnail_url TEXT,
  featured_image_url TEXT,
  project_url TEXT,
  project_duration TEXT,
  team_size INTEGER,
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_industry ON case_studies(industry);
CREATE INDEX IF NOT EXISTS idx_case_studies_published ON case_studies(published);
CREATE INDEX IF NOT EXISTS idx_case_studies_featured ON case_studies(featured);

-- Enable Row Level Security
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

-- Create policy for public reads (only published case studies)
CREATE POLICY "Enable read for published case studies"
  ON case_studies
  FOR SELECT
  USING (published = true);

-- Create policy for admin access (full CRUD)
CREATE POLICY "Enable all operations for admins"
  ON case_studies
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_case_studies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS case_studies_updated_at ON case_studies;
CREATE TRIGGER case_studies_updated_at
  BEFORE UPDATE ON case_studies
  FOR EACH ROW
  EXECUTE FUNCTION update_case_studies_updated_at();

-- Insert sample case studies
INSERT INTO case_studies (
  title,
  slug,
  client_name,
  industry,
  project_type,
  description,
  challenge,
  solution,
  results,
  technologies,
  metrics,
  testimonial_text,
  testimonial_author,
  testimonial_role,
  testimonial_video_url,
  thumbnail_url,
  project_duration,
  team_size,
  published,
  featured
) VALUES
(
  'SaaS Platform Scalability: 10x User Growth in 6 Months',
  'saas-scalability-10x-growth',
  'TechFlow Analytics',
  'SaaS',
  'Full-Stack Development',
  'Helped a B2B SaaS analytics platform handle 10x user growth without performance degradation.',
  'TechFlow was experiencing rapid growth but their infrastructure couldn''t scale. Database queries were taking 10+ seconds, causing customer churn. They needed to support 10x more users within 6 months.',
  'We implemented a complete architecture overhaul: database optimization with read replicas, Redis caching layer, CDN integration, and microservices architecture. Added real-time monitoring and auto-scaling infrastructure.',
  'Successfully handled 10x user growth with 95% faster page load times. Customer churn reduced by 40%. System now handles 50,000 concurrent users with 99.99% uptime.',
  '["Next.js", "PostgreSQL", "Redis", "AWS", "Docker", "Kubernetes"]',
  '[{"label": "User Growth", "value": "10x"}, {"label": "Page Load Time", "value": "95% faster"}, {"label": "Churn Reduction", "value": "40%"}, {"label": "Uptime", "value": "99.99%"}]',
  'Hudson Digital Solutions transformed our infrastructure. We went from constant firefighting to confident scaling. Best technical decision we ever made.',
  'Sarah Chen',
  'CTO, TechFlow Analytics',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  '/images/case-studies/techflow-thumbnail.jpg',
  '4 months',
  4,
  true,
  true
),
(
  'E-commerce Checkout Optimization: 45% Conversion Increase',
  'ecommerce-checkout-optimization',
  'StyleHub Fashion',
  'E-commerce',
  'Conversion Rate Optimization',
  'Redesigned checkout flow for a fashion e-commerce site, increasing conversions by 45% and reducing cart abandonment by 60%.',
  'StyleHub had high traffic but terrible conversion rates. 75% of users abandoned their carts during checkout. Mobile experience was particularly poor with complex multi-step process.',
  'We implemented a streamlined one-page checkout with real-time validation, multiple payment options, guest checkout, and mobile-first design. Added abandoned cart recovery automation and A/B testing framework.',
  '45% increase in conversion rate. 60% reduction in cart abandonment. Mobile conversions up 120%. Average order value increased by 25%.',
  '["React", "Node.js", "Stripe", "MongoDB", "Tailwind CSS"]',
  '[{"label": "Conversion Rate", "value": "+45%"}, {"label": "Cart Abandonment", "value": "-60%"}, {"label": "Mobile Conversions", "value": "+120%"}, {"label": "Avg Order Value", "value": "+25%"}]',
  'The new checkout flow is incredible. Our revenue jumped 45% in the first month alone. Hudson Digital Solutions delivered beyond our wildest expectations.',
  'Michael Rodriguez',
  'Founder & CEO, StyleHub Fashion',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  '/images/case-studies/stylehub-thumbnail.jpg',
  '3 months',
  3,
  true,
  true
),
(
  'Healthcare Patient Portal: HIPAA-Compliant Telehealth Platform',
  'healthcare-telehealth-platform',
  'MediConnect Health',
  'Healthcare',
  'Telehealth Development',
  'Built a HIPAA-compliant telehealth platform enabling remote consultations, reducing in-person visits by 70%.',
  'MediConnect needed a telehealth solution during pandemic surge. Required HIPAA compliance, EHR integration, high-quality video, and support for 1,000+ concurrent consultations.',
  'We developed a complete telehealth platform with HIPAA-compliant video, EHR integration, automated appointment scheduling, prescription management, and patient portal. Passed HIPAA audit on first attempt.',
  '70% reduction in in-person visits. 95% patient satisfaction rating. 1,000+ daily consultations. Zero security breaches. Passed HIPAA audit first time.',
  '["Next.js", "PostgreSQL", "WebRTC", "AWS", "HL7 FHIR"]',
  '[{"label": "In-Person Visits", "value": "-70%"}, {"label": "Patient Satisfaction", "value": "95%"}, {"label": "Daily Consultations", "value": "1,000+"}, {"label": "Security Breaches", "value": "0"}]',
  'Hudson Digital Solutions built us a world-class telehealth platform that our patients love. The HIPAA compliance expertise was invaluable. Highly recommended.',
  'Dr. Jennifer Martinez',
  'Chief Medical Officer, MediConnect Health',
  null,
  '/images/case-studies/mediconnect-thumbnail.jpg',
  '6 months',
  5,
  true,
  false
);
