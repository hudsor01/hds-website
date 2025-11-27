-- Migration: Create help articles table
-- Description: Knowledge base / help center articles

CREATE TABLE IF NOT EXISTS help_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  order_index INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_help_articles_category ON help_articles(category);
CREATE INDEX idx_help_articles_slug ON help_articles(slug);
CREATE INDEX idx_help_articles_published ON help_articles(published);
CREATE INDEX idx_help_articles_order ON help_articles(category, order_index);

-- Enable Row Level Security
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can read published articles
CREATE POLICY "Anyone can read published articles" ON help_articles
  FOR SELECT USING (published = true);

-- Authenticated users can manage all articles
CREATE POLICY "Authenticated users can manage articles" ON help_articles
  FOR ALL USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_help_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER help_articles_updated_at
  BEFORE UPDATE ON help_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_help_articles_updated_at();

-- Comments for documentation
COMMENT ON TABLE help_articles IS 'Knowledge base articles for help center';
COMMENT ON COLUMN help_articles.category IS 'Category slug: getting-started, billing, tools, account, faq';
COMMENT ON COLUMN help_articles.content IS 'Markdown content for the article';
COMMENT ON COLUMN help_articles.order_index IS 'Sort order within category';

-- Insert sample articles for initial categories (optional - can be removed in production)
INSERT INTO help_articles (slug, category, title, content, excerpt, order_index, published) VALUES
-- Getting Started
('welcome-to-hudson-digital', 'getting-started', 'Welcome to Hudson Digital Solutions',
'## Welcome!

Thank you for choosing Hudson Digital Solutions. We''re excited to have you on board!

### What We Do

Hudson Digital Solutions is a Texas-based digital agency specializing in:
- **Web Development** - Custom websites and web applications
- **SaaS Consulting** - Building and scaling software products
- **Digital Marketing** - SEO, content strategy, and growth marketing

### Getting Support

If you need help at any time, you can:
- Browse this help center for answers
- Email us at hello@hudsondigitalsolutions.com
- Use the contact form on our website

We typically respond within 24 business hours.',
'Welcome to Hudson Digital Solutions! Learn about our services and how to get support.',
1, true),

('how-to-use-our-tools', 'getting-started', 'How to Use Our Free Tools',
'## Our Free Tools

We offer a variety of free tools to help with your business needs:

### Financial Tools
- **ROI Calculator** - Calculate return on investment for your projects
- **Mortgage Calculator** - Estimate monthly mortgage payments
- **Tip Calculator** - Split bills and calculate tips easily

### Business Tools
- **Invoice Generator** - Create professional invoices in PDF
- **Contract Generator** - Generate common business contracts
- **Proposal Generator** - Build project proposals

### Developer Tools
- **JSON Formatter** - Format and validate JSON data
- **Meta Tag Generator** - Create SEO meta tags
- **Password Generator** - Generate secure passwords

### How to Access

All tools are available at [hudsondigitalsolutions.com/tools](/tools). No account required!',
'Learn about our free business, financial, and developer tools.',
2, true),

-- Tools
('using-the-invoice-generator', 'tools', 'Using the Invoice Generator',
'## Invoice Generator Guide

Our Invoice Generator helps you create professional invoices in seconds.

### Features
- Pre-filled company information
- Line item management
- Automatic tax calculation
- PDF download
- Draft saving

### How to Use

1. **Company Info** - Update your company details if needed
2. **Client Info** - Enter your client''s name and contact details
3. **Invoice Details** - Set invoice number, date, and due date
4. **Line Items** - Add services/products with quantity and rate
5. **Tax Rate** - Set applicable tax percentage
6. **Download** - Click "Download PDF" to save your invoice

### Tips
- Your draft is automatically saved in your browser
- Use the "Clear Draft" button to start fresh
- Include detailed descriptions for clarity',
'Learn how to create professional invoices with our free Invoice Generator.',
1, true),

-- Billing
('payment-methods', 'billing', 'Accepted Payment Methods',
'## Payment Methods

We accept various payment methods for our services:

### Standard Payment
- **Bank Transfer (ACH)** - Preferred for invoices over $1,000
- **Credit/Debit Cards** - Visa, Mastercard, American Express
- **PayPal** - For international clients

### Payment Terms
- Net 30 is our standard payment term
- 50% deposit required for projects over $5,000
- Monthly retainers are billed at the beginning of each month

### Questions?

Contact our billing team at hello@hudsondigitalsolutions.com for any payment questions.',
'Information about accepted payment methods and billing terms.',
1, true),

-- FAQ
('what-services-do-you-offer', 'faq', 'What Services Do You Offer?',
'## Our Services

### Web Development
Custom websites, web applications, and e-commerce solutions built with modern technologies like Next.js, React, and TypeScript.

### SaaS Consulting
End-to-end support for software products - from MVP development to scaling your existing platform.

### Digital Marketing
SEO optimization, content strategy, and growth marketing to help your business reach more customers.

### Revenue Operations
Sales process optimization, CRM implementation, and marketing automation.

For detailed information, visit our [Services page](/services).',
'Overview of web development, SaaS consulting, and digital marketing services.',
1, true),

('how-long-does-a-project-take', 'faq', 'How Long Does a Project Take?',
'## Project Timelines

Project duration varies based on scope and complexity:

### Typical Timelines

| Project Type | Duration |
|--------------|----------|
| Landing Page | 1-2 weeks |
| Business Website | 4-6 weeks |
| Web Application | 8-16 weeks |
| SaaS Product | 12-24 weeks |

### Factors Affecting Timeline
- Project complexity and features
- Content and asset availability
- Revision rounds
- Third-party integrations

### Rush Projects
Need something faster? Contact us to discuss expedited options (additional fees may apply).',
'Learn about typical project timelines for different types of work.',
2, true);
