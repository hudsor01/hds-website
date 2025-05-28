-- Migration: Add content management tables for blog, services, testimonials, and case studies
-- Created: 2025-01-28
-- Description: Adds comprehensive content management system with blog posts, services, testimonials, and case studies

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- Blog posts table
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT[],
    "featuredImage" TEXT,
    "gallery" TEXT[],
    "categories" TEXT[],
    "tags" TEXT[],
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "readTimeMinutes" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- Services table
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "startingPrice" DECIMAL(65,30),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "priceUnit" TEXT NOT NULL DEFAULT 'project',
    "features" TEXT[],
    "benefits" TEXT[],
    "deliverables" TEXT[],
    "icon" TEXT,
    "featuredImage" TEXT,
    "gallery" TEXT[],
    "category" TEXT,
    "tags" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "estimatedTimeline" TEXT,
    "targetAudience" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- Testimonials table
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "avatar" TEXT,
    "companyLogo" TEXT,
    "serviceUsed" TEXT,
    "projectType" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "email" TEXT,
    "linkedIn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- Case studies table
CREATE TABLE "case_studies" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientIndustry" TEXT,
    "clientSize" TEXT,
    "clientWebsite" TEXT,
    "clientLogo" TEXT,
    "challenge" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "timeline" TEXT,
    "teamSize" INTEGER,
    "servicesUsed" TEXT[],
    "technologies" TEXT[],
    "results" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "featuredImage" TEXT,
    "beforeImage" TEXT,
    "afterImage" TEXT,
    "gallery" TEXT[],
    "videoUrl" TEXT,
    "category" TEXT,
    "tags" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_studies_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");
CREATE UNIQUE INDEX "case_studies_slug_key" ON "case_studies"("slug");

-- Create performance indexes
CREATE INDEX "blog_posts_status_publishedAt_idx" ON "blog_posts"("status", "publishedAt" DESC);
CREATE INDEX "blog_posts_categories_idx" ON "blog_posts" USING GIN ("categories");
CREATE INDEX "blog_posts_tags_idx" ON "blog_posts" USING GIN ("tags");
CREATE INDEX "services_featured_displayOrder_idx" ON "services"("featured" DESC, "displayOrder" ASC);
CREATE INDEX "services_isActive_category_idx" ON "services"("isActive", "category");
CREATE INDEX "testimonials_featured_displayOrder_idx" ON "testimonials"("featured" DESC, "displayOrder" ASC);
CREATE INDEX "testimonials_isActive_serviceUsed_idx" ON "testimonials"("isActive", "serviceUsed");
CREATE INDEX "case_studies_status_publishedAt_idx" ON "case_studies"("status", "publishedAt" DESC);
CREATE INDEX "case_studies_featured_displayOrder_idx" ON "case_studies"("featured" DESC, "displayOrder" ASC);

-- Add updated_at triggers for automatic timestamping
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at 
    BEFORE UPDATE ON testimonials 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_studies_updated_at 
    BEFORE UPDATE ON case_studies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data to replace the hardcoded data from data-fetchers.ts

-- Sample services (replacing the hardcoded ones)
INSERT INTO "services" (
    "id", "slug", "name", "description", "shortDescription", "startingPrice", 
    "features", "benefits", "featured", "displayOrder", "category", "estimatedTimeline"
) VALUES 
(
    'revenue-operations',
    'revenue-operations',
    'Revenue Operations',
    'Optimize your sales process and CRM for maximum efficiency with proven RevOps strategies that have generated over $2M in client revenue.',
    'Transform your sales process with enterprise-grade RevOps automation',
    1499.00,
    ARRAY['CRM Setup & Optimization', 'Sales Process Automation', 'Lead Scoring & Management', 'Revenue Analytics Dashboard', 'Team Training & Support'],
    ARRAY['Increase sales productivity by 40%', 'Improve lead conversion by 2x', 'Reduce admin tasks by 60%', 'Get real-time revenue insights'],
    true,
    1,
    'automation',
    '2-4 weeks'
),
(
    'web-development',
    'web-development',
    'Web Development',
    'Custom websites and web applications built for performance, SEO, and conversion optimization using modern technologies.',
    'High-performance websites that convert visitors into customers',
    799.00,
    ARRAY['Custom Website Design', 'E-commerce Solutions', 'SEO Optimization', 'Mobile Responsive', 'Performance Optimization'],
    ARRAY['Professional online presence', 'Mobile-first design', 'Search engine optimized', 'Fast loading speeds', 'Conversion focused'],
    false,
    2,
    'development',
    '3-6 weeks'
),
(
    'data-analytics',
    'data-analytics',
    'Data Analytics',
    'Business intelligence and reporting solutions that turn your data into actionable insights for informed decision-making.',
    'Transform raw data into powerful business insights',
    599.00,
    ARRAY['Data Visualization', 'Custom Dashboards', 'KPI Tracking', 'Automated Reports', 'Business Intelligence'],
    ARRAY['Data-driven decisions', 'Real-time insights', 'Automated reporting', 'Performance tracking', 'Growth identification'],
    false,
    3,
    'analytics',
    '2-3 weeks'
);

-- Sample testimonials (replacing the hardcoded ones)
INSERT INTO "testimonials" (
    "id", "name", "role", "company", "content", "rating", "serviceUsed", "featured", "displayOrder", "verified"
) VALUES 
(
    'testimonial-1',
    'Sarah Johnson',
    'Owner',
    'Local Fitness Studio',
    'Richard transformed our lead management process. We now capture 3x more leads and convert 40% more prospects into paying members.',
    5,
    'revenue-operations',
    true,
    1,
    true
),
(
    'testimonial-2',
    'Mike Chen',
    'CEO',
    'Tech Startup',
    'The revenue operations improvements saved us 15 hours per week and increased our sales velocity by 60%. Our team can now focus on selling, not data entry.',
    5,
    'revenue-operations',
    true,
    2,
    true
),
(
    'testimonial-3',
    'Lisa Rodriguez',
    'Founder',
    'E-commerce Business',
    'Our new website and CRM integration resulted in a 200% increase in online sales within 3 months. The ROI was incredible.',
    5,
    'web-development',
    true,
    3,
    true
);

-- Sample case studies (replacing the hardcoded ones)
INSERT INTO "case_studies" (
    "id", "slug", "title", "description", "clientName", "clientIndustry", "challenge", "solution", 
    "servicesUsed", "results", "metrics", "featured", "status", "publishedAt"
) VALUES 
(
    'spotio-deduplication',
    'spotio-crm-deduplication',
    'Spotio CRM Deduplication',
    'Eliminated 40,000+ duplicate records and implemented automated deduplication for a sales technology company.',
    'Spotio (Confidential)',
    'Sales Technology',
    'Sales team struggling with 40,000+ duplicate records in their CRM, causing confusion and lost opportunities.',
    'Implemented automated deduplication system using custom algorithms and process automation.',
    ARRAY['revenue-operations', 'data-analytics'],
    '{"duplicatesRemoved": "40,000+", "timeReduction": "15 hours/week", "dataAccuracy": "+95%"}',
    '{"before": {"accuracy": "60%", "timeSpent": "20 hours/week"}, "after": {"accuracy": "95%", "timeSpent": "5 hours/week"}}',
    true,
    'PUBLISHED',
    CURRENT_TIMESTAMP
),
(
    'tattoo-booking',
    'tattoo-studio-booking-system',
    'Tattoo Studio Booking System',
    'Built custom booking system with 40% increase in conversions for a high-end tattoo studio.',
    'Elite Ink Studio (Confidential)',
    'Personal Services',
    'Manual booking process leading to missed appointments and poor customer experience.',
    'Developed custom booking platform with automated confirmations and payment processing.',
    ARRAY['web-development', 'revenue-operations'],
    '{"conversionIncrease": "+40%", "bookingEfficiency": "+60%", "customerSatisfaction": "98%"}',
    '{"before": {"conversion": "15%", "booking_time": "10 minutes"}, "after": {"conversion": "55%", "booking_time": "2 minutes"}}',
    true,
    'PUBLISHED',
    CURRENT_TIMESTAMP
);

-- Sample blog posts (replacing the hardcoded ones)
INSERT INTO "blog_posts" (
    "id", "slug", "title", "excerpt", "content", "authorName", "categories", "tags", 
    "status", "publishedAt", "readTimeMinutes"
) VALUES 
(
    'revenue-operations-basics',
    'revenue-operations-basics',
    'Revenue Operations Basics for Small Business',
    'Learn the fundamentals of RevOps and how it can transform your sales process for sustainable growth.',
    '# Revenue Operations Basics for Small Business\n\nRevenue Operations (RevOps) is the alignment of sales, marketing, and customer success operations...',
    'Richard Hudson',
    ARRAY['Revenue Operations', 'Business Growth'],
    ARRAY['revops', 'sales', 'automation', 'crm'],
    'PUBLISHED',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    8
),
(
    'crm-optimization-guide',
    'crm-optimization-guide',
    'The Complete CRM Optimization Guide',
    'Step-by-step guide to optimizing your CRM for maximum efficiency and ROI with actionable strategies.',
    '# The Complete CRM Optimization Guide\n\nYour CRM is the backbone of your sales operation. Here''s how to optimize it...',
    'Richard Hudson',
    ARRAY['CRM', 'Sales Operations'],
    ARRAY['crm', 'optimization', 'sales', 'efficiency'],
    'PUBLISHED',
    CURRENT_TIMESTAMP - INTERVAL '10 days',
    12
);

-- Add Row Level Security (RLS) for public read access
ALTER TABLE "blog_posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "testimonials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "case_studies" ENABLE ROW LEVEL SECURITY;

-- Public read policies for published content
CREATE POLICY "Allow public read access to published blog posts" 
    ON "blog_posts" FOR SELECT 
    USING ("status" = 'PUBLISHED');

CREATE POLICY "Allow public read access to active services" 
    ON "services" FOR SELECT 
    USING ("isActive" = true);

CREATE POLICY "Allow public read access to active testimonials" 
    ON "testimonials" FOR SELECT 
    USING ("isActive" = true);

CREATE POLICY "Allow public read access to published case studies" 
    ON "case_studies" FOR SELECT 
    USING ("status" = 'PUBLISHED');

-- Admin full access policies (assuming admin authentication exists)
CREATE POLICY "Allow admin full access to blog posts" 
    ON "blog_posts" FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to services" 
    ON "services" FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to testimonials" 
    ON "testimonials" FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to case studies" 
    ON "case_studies" FOR ALL 
    USING (auth.role() = 'authenticated');