-- Migration: Create projects table for portfolio management
-- This enables dynamic project pages with individual SEO, caching, and scalability

CREATE TABLE IF NOT EXISTS public.projects (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,

  -- Core content
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT, -- For detailed project page

  -- Media
  image_url TEXT NOT NULL,
  gallery_images TEXT[], -- Array of image URLs for project page
  gradient_class TEXT NOT NULL DEFAULT 'bg-gradient-primary',

  -- Metrics (stored as JSONB for flexibility)
  stats JSONB NOT NULL DEFAULT '{}',

  -- Technology stack
  tech_stack TEXT[] NOT NULL DEFAULT '{}',

  -- Links
  external_link TEXT,
  github_link TEXT,
  case_study_url TEXT,

  -- Status and visibility
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,

  -- SEO metadata
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,

  -- Analytics
  view_count INTEGER NOT NULL DEFAULT 0,

  -- Constraints
  CONSTRAINT projects_slug_check CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT projects_category_check CHECK (category IN (
    'SaaS Platform',
    'Business Website',
    'Personal Portfolio',
    'E-Commerce',
    'Mobile App',
    'Web App',
    'API/Backend',
    'Other'
  ))
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_slug
  ON public.projects(slug);

CREATE INDEX IF NOT EXISTS idx_projects_published
  ON public.projects(published, display_order)
  WHERE published = true;

CREATE INDEX IF NOT EXISTS idx_projects_category
  ON public.projects(category)
  WHERE published = true;

CREATE INDEX IF NOT EXISTS idx_projects_featured
  ON public.projects(featured, display_order)
  WHERE published = true AND featured = true;

CREATE INDEX IF NOT EXISTS idx_projects_created_at
  ON public.projects(created_at DESC)
  WHERE published = true;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER projects_updated_at_trigger
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published projects
CREATE POLICY "Allow public read access to published projects"
  ON public.projects
  FOR SELECT
  USING (published = true);

-- Allow authenticated users to read all projects (for admin dashboard)
CREATE POLICY "Allow authenticated users to read all projects"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert initial projects (migrated from hardcoded data)
INSERT INTO public.projects (
  slug,
  title,
  category,
  description,
  long_description,
  image_url,
  gradient_class,
  stats,
  tech_stack,
  external_link,
  featured,
  published,
  display_order,
  published_at
) VALUES
(
  'tenantflow',
  'TenantFlow.app',
  'SaaS Platform',
  'Modern property management platform helping landlords streamline operations, tenant communications, and financial tracking with automated workflows.',
  'TenantFlow is a comprehensive property management SaaS platform built to help landlords and property managers streamline their operations. The platform features automated workflows for tenant communications, financial tracking, maintenance requests, and lease management. With a focus on user experience and reliability, TenantFlow has helped over 1,000 properties achieve 300% efficiency gains.',
  '/portfolio/tenantflow.jpg',
  'bg-gradient-primary',
  '{"properties": "1K+", "efficiency": "+300%", "uptime": "99.9%"}',
  ARRAY['Next.js 14', 'TypeScript', 'Prisma', 'PostgreSQL', 'Stripe'],
  'https://tenantflow.app',
  true,
  true,
  1,
  NOW()
),
(
  'ink37-tattoos',
  'Ink37 Tattoos',
  'Business Website',
  'Premium tattoo studio website featuring artist portfolios, online booking system, and customer gallery with modern design aesthetics.',
  'A beautifully designed website for Ink37 Tattoos, featuring artist portfolios, an integrated online booking system, and a customer gallery. The site showcases the studio''s work with a modern, visually striking design that converts visitors into bookings. Results include a 180% increase in bookings and 4.8/5 engagement rating.',
  '/portfolio/ink37.jpg',
  'bg-gradient-decorative-purple',
  '{"bookings": "+180%", "engagement": "4.8/5", "conversion": "+120%"}',
  ARRAY['React', 'Next.js', 'Tailwind CSS', 'Vercel', 'CMS'],
  'https://ink37tattoos.com',
  false,
  true,
  2,
  NOW()
),
(
  'richard-w-hudson-jr',
  'Richard W Hudson Jr',
  'Personal Portfolio',
  'Professional portfolio showcasing leadership experience, technical expertise, and project management capabilities with clean, modern design.',
  'A professional portfolio website highlighting leadership experience, technical expertise, and project management capabilities. The site features a clean, modern design that effectively communicates professional achievements and technical skills. Showcases 50+ projects with 10+ years of experience and 98% client satisfaction.',
  '/portfolio/richard-portfolio.jpg',
  'bg-gradient-secondary',
  '{"projects": "50+", "experience": "10+ years", "satisfaction": "98%"}',
  ARRAY['Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel Analytics'],
  'https://richardwhudsonjr.com',
  false,
  true,
  3,
  NOW()
),
(
  'hudson-digital-solutions',
  'Hudson Digital Solutions',
  'Business Website',
  'Company website showcasing full-stack development, revenue operations, and partnership management services with conversion-optimized design.',
  'The company website for Hudson Digital Solutions, built with cutting-edge technology and conversion-focused design. Features comprehensive service showcases, case studies, and lead generation optimization. Achieved 250% increase in leads, 98/100 performance score, and 180% conversion rate improvement.',
  '/portfolio/hudson-digital.jpg',
  'bg-gradient-primary',
  '{"leads": "+250%", "performance": "98/100", "conversion": "+180%"}',
  ARRAY['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS', 'Supabase'],
  'https://hudsondigitalsolutions.com',
  true,
  true,
  0,
  NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.projects IS 'Portfolio projects with full metadata for SEO and analytics';
COMMENT ON COLUMN public.projects.slug IS 'URL-friendly identifier for project pages';
COMMENT ON COLUMN public.projects.stats IS 'Project metrics as JSON (e.g., {"leads": "+250%", "performance": "98/100"})';
COMMENT ON COLUMN public.projects.tech_stack IS 'Array of technologies used in the project';
COMMENT ON COLUMN public.projects.display_order IS 'Lower numbers appear first (0 = highest priority)';
COMMENT ON COLUMN public.projects.view_count IS 'Number of times project page has been viewed';
