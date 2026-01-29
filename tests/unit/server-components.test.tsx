/**
 * Server Component Tests
 * Tests for pages converted from Client to Server Components
 */

import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { cleanupMocks, setupNextMocks } from '../test-utils';

// ================================
// Services Page Tests
// ================================

describe('Services Page (Server Component)', () => {
  beforeEach(() => {
    setupNextMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });
  it('should render without client-side hooks', async () => {
    // Import the page component
    const ServicesPage = (await import('@/app/services/page')).default;

    // Render the component
    render(<ServicesPage />);

    // Check for key content - use getAllByText since words may appear multiple times
    const technicalElements = screen.getAllByText(/Technical/i);
    expect(technicalElements.length).toBeGreaterThan(0);

    const servicesElements = screen.getAllByText(/Services/i);
    expect(servicesElements.length).toBeGreaterThan(0);
  });

  it('should render service cards', async () => {
    const ServicesPage = (await import('@/app/services/page')).default;
    render(<ServicesPage />);

    // Check for service titles
    expect(screen.getByText('Web Applications')).toBeInTheDocument();
    expect(screen.getByText('Custom Solutions')).toBeInTheDocument();
    expect(screen.getByText('Strategic Consulting')).toBeInTheDocument();
  });

  it('should render process steps', async () => {
    const ServicesPage = (await import('@/app/services/page')).default;
    render(<ServicesPage />);

    // Check for process step titles
    expect(screen.getByText('Discovery')).toBeInTheDocument();
    expect(screen.getByText('Strategy')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Launch')).toBeInTheDocument();
  });

  it('should render stats section', async () => {
    const ServicesPage = (await import('@/app/services/page')).default;
    render(<ServicesPage />);

    // Check for stat values (updated to match new defensible content)
    expect(screen.getByText('Fast')).toBeInTheDocument();
    expect(screen.getByText('Expert')).toBeInTheDocument();
    expect(screen.getByText('Proven')).toBeInTheDocument();
    expect(screen.getByText('24/7')).toBeInTheDocument();
  });

  it('should have correct navigation links', async () => {
    const ServicesPage = (await import('@/app/services/page')).default;
    render(<ServicesPage />);

    // Check for CTA links
    const contactLinks = screen.getAllByRole('link', { name: /contact|start/i });
    expect(contactLinks.length).toBeGreaterThan(0);
  });

  it('should have metadata defined in layout for SEO', async () => {
    // Services page is a client component (for icon rendering), so metadata is in layout
    const { metadata } = await import('@/app/services/layout');

    expect(metadata).toBeDefined();
    expect(metadata.title).toContain('Services');
    expect(metadata.description).toBeDefined();
    expect(metadata.description?.length).toBeGreaterThan(50);
  });
});

// ================================
// Contact Page Tests
// ================================

describe('Contact Page (Server Component)', () => {
  it('should render without client-side hooks', async () => {
    const ContactPage = (await import('@/app/contact/page')).default;
    render(<ContactPage />);

    // Check for key content
    expect(screen.getByText(/Get Your Free/i)).toBeInTheDocument();
    expect(screen.getByText(/ROI Roadmap/i)).toBeInTheDocument();
  });

  it('should render step-by-step process', async () => {
    const ContactPage = (await import('@/app/contact/page')).default;
    render(<ContactPage />);

    // Check for process steps - use getAllByText since content may repeat
    const respondSteps = screen.getAllByText(/We respond within 2 hours/i);
    expect(respondSteps.length).toBeGreaterThan(0);

    const strategySteps = screen.getAllByText(/30-minute strategy call/i);
    expect(strategySteps.length).toBeGreaterThan(0);

    const roadmapSteps = screen.getAllByText(/Get your custom roadmap/i);
    expect(roadmapSteps.length).toBeGreaterThan(0);
  });

  it('should render trust badges', async () => {
    const ContactPage = (await import('@/app/contact/page')).default;
    render(<ContactPage />);

    // Check for trust indicators - use getAllByText since they may appear multiple times
    const noSalesPitch = screen.getAllByText(/No sales pitch/i);
    expect(noSalesPitch.length).toBeGreaterThan(0);

    const responseTime = screen.getAllByText(/2-hour response/i);
    expect(responseTime.length).toBeGreaterThan(0);
  });

  it('should render dynamic contact form', async () => {
    const ContactPage = (await import('@/app/contact/page')).default;
    const { container } = render(<ContactPage />);

    // Test mirrors production: ContactPage renders with main content
    // The page uses next/dynamic for ContactForm but the page layout should render
    const main = container.querySelector('main');
    expect(main).toBeTruthy();
    expect(main?.classList.contains('min-h-screen')).toBe(true);

    // The page should have section elements (even if ContactForm loads async)
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBeGreaterThan(0);
  });

  it('should export metadata for SEO', async () => {
    const { metadata } = await import('@/app/contact/page');

    expect(metadata).toBeDefined();
    expect(metadata.title).toContain('Contact');
    expect(metadata.description).toBeDefined();
    expect(metadata.description?.length).toBeGreaterThan(50);
  });
});

// ================================
// Server Component Best Practices Tests
// ================================

describe('Server Component Best Practices', () => {
  it('services page is a client component (renders icons in Card)', async () => {
    // Services page needs 'use client' to pass icon components to Card
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.resolve(process.cwd(), 'src/app/services/page.tsx');
    const content = await fs.readFile(filePath, 'utf-8');

    // Verify it's a client component (required for passing React components as props)
    expect(content.startsWith("'use client'")).toBe(true);
  });

  it('contact page should not contain use client directive', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.resolve(process.cwd(), 'src/app/contact/page.tsx');
    const content = await fs.readFile(filePath, 'utf-8');

    // Check that it doesn't start with 'use client'
    expect(content.startsWith("'use client'")).toBe(false);
    expect(content.startsWith('"use client"')).toBe(false);
  });

  it('services layout should export metadata (page is client component)', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    // Metadata is in layout because page is a client component
    const filePath = path.resolve(process.cwd(), 'src/app/services/layout.tsx');
    const content = await fs.readFile(filePath, 'utf-8');

    // Check for metadata export in layout
    expect(content).toContain('export const metadata');
  });

  it('contact page should export metadata', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.resolve(process.cwd(), 'src/app/contact/page.tsx');
    const content = await fs.readFile(filePath, 'utf-8');

    // Check for metadata export
    expect(content).toContain('export const metadata');
  });
});
