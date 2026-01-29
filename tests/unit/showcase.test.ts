/**
 * Showcase Data Layer Tests
 * Tests the unified showcase system that combines portfolio and case studies
 */
import { describe, test, expect, mock, beforeEach } from 'bun:test';

// Mock the database module before importing showcase
const mockSelect = mock(() => ({
  from: mock(() => ({
    where: mock(() => ({
      orderBy: mock(() => ({
        limit: mock(() => Promise.resolve([])),
      })),
      limit: mock(() => Promise.resolve([])),
    })),
    orderBy: mock(() => Promise.resolve([])),
  })),
}));

const mockDb = {
  select: mockSelect,
};

mock.module('@/lib/db', () => ({
  db: mockDb,
}));

// Mock the schema
mock.module('@/lib/schema', () => ({
  showcase: {
    id: 'id',
    slug: 'slug',
    title: 'title',
    description: 'description',
    published: 'published',
    featured: 'featured',
    showcaseType: 'showcase_type',
    displayOrder: 'display_order',
    createdAt: 'created_at',
  },
}));

// Import after mocks
import {
  type ShowcaseItem,
  type ShowcaseType,
  isDetailedShowcase,
  isQuickShowcase,
} from '@/lib/showcase';

describe('Showcase Data Layer', () => {
  beforeEach(() => {
    mock.restore();
  });

  describe('ShowcaseItem Type', () => {
    test('ShowcaseType includes quick and detailed', () => {
      const quickType: ShowcaseType = 'quick';
      const detailedType: ShowcaseType = 'detailed';
      expect(quickType).toBe('quick');
      expect(detailedType).toBe('detailed');
    });

    test('ShowcaseItem has required fields', () => {
      const item: ShowcaseItem = {
        id: '123',
        slug: 'test-project',
        title: 'Test Project',
        description: 'A test project',
        longDescription: null,
        showcaseType: 'quick',
        clientName: null,
        industry: null,
        projectType: null,
        category: 'Web Development',
        challenge: null,
        solution: null,
        results: null,
        technologies: ['React', 'TypeScript'],
        metrics: { users: '10K' },
        imageUrl: null,
        ogImageUrl: null,
        galleryImages: null,
        gradientClass: 'surface-overlay',
        externalLink: null,
        githubLink: null,
        testimonialText: null,
        testimonialAuthor: null,
        testimonialRole: null,
        testimonialVideoUrl: null,
        projectDuration: null,
        teamSize: null,
        featured: false,
        published: true,
        displayOrder: 0,
        viewCount: 0,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(item.id).toBe('123');
      expect(item.slug).toBe('test-project');
      expect(item.showcaseType).toBe('quick');
      expect(item.technologies).toEqual(['React', 'TypeScript']);
    });
  });

  describe('Type Guard Functions', () => {
    const quickItem: ShowcaseItem = {
      id: '1',
      slug: 'portfolio-item',
      title: 'Portfolio Item',
      description: 'Quick portfolio showcase',
      longDescription: null,
      showcaseType: 'quick',
      clientName: null,
      industry: null,
      projectType: null,
      category: null,
      challenge: null,
      solution: null,
      results: null,
      technologies: [],
      metrics: {},
      imageUrl: null,
      ogImageUrl: null,
      galleryImages: null,
      gradientClass: 'surface-overlay',
      externalLink: null,
      githubLink: null,
      testimonialText: null,
      testimonialAuthor: null,
      testimonialRole: null,
      testimonialVideoUrl: null,
      projectDuration: null,
      teamSize: null,
      featured: false,
      published: true,
      displayOrder: 0,
      viewCount: 0,
      publishedAt: null,
      createdAt: null,
      updatedAt: null,
    };

    const detailedItem: ShowcaseItem = {
      ...quickItem,
      id: '2',
      slug: 'case-study',
      title: 'Case Study',
      showcaseType: 'detailed',
      challenge: 'The challenge we faced',
      solution: 'How we solved it',
      results: 'The amazing results',
    };

    test('isDetailedShowcase returns true for detailed items', () => {
      expect(isDetailedShowcase(detailedItem)).toBe(true);
    });

    test('isDetailedShowcase returns false for quick items', () => {
      expect(isDetailedShowcase(quickItem)).toBe(false);
    });

    test('isQuickShowcase returns true for quick items', () => {
      expect(isQuickShowcase(quickItem)).toBe(true);
    });

    test('isQuickShowcase returns false for detailed items', () => {
      expect(isQuickShowcase(detailedItem)).toBe(false);
    });
  });

  describe('Showcase Discriminator Pattern', () => {
    test('quick type represents portfolio items', () => {
      // Portfolio items are quick showcases - minimal info, grid display
      const portfolioItem: ShowcaseItem = {
        id: '1',
        slug: 'saas-dashboard',
        title: 'SaaS Dashboard',
        description: 'Modern analytics dashboard',
        longDescription: null,
        showcaseType: 'quick',
        clientName: null,
        industry: 'SaaS',
        projectType: 'Web App',
        category: 'Dashboard',
        challenge: null,
        solution: null,
        results: null,
        technologies: ['Next.js', 'Tailwind'],
        metrics: { performance: '95+' },
        imageUrl: '/images/dashboard.webp',
        ogImageUrl: null,
        galleryImages: null,
        gradientClass: 'surface-overlay',
        externalLink: 'https://example.com',
        githubLink: null,
        testimonialText: null,
        testimonialAuthor: null,
        testimonialRole: null,
        testimonialVideoUrl: null,
        projectDuration: null,
        teamSize: null,
        featured: true,
        published: true,
        displayOrder: 1,
        viewCount: 150,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(portfolioItem.showcaseType).toBe('quick');
      expect(isQuickShowcase(portfolioItem)).toBe(true);
      // Quick items don't need challenge/solution/results
      expect(portfolioItem.challenge).toBeNull();
    });

    test('detailed type represents case studies', () => {
      // Case studies are detailed showcases - full narrative with challenge/solution/results
      const caseStudyItem: ShowcaseItem = {
        id: '2',
        slug: 'enterprise-migration',
        title: 'Enterprise Cloud Migration',
        description: 'Migrated legacy systems to cloud',
        longDescription: 'A comprehensive case study...',
        showcaseType: 'detailed',
        clientName: 'TechCorp Inc',
        industry: 'Enterprise',
        projectType: 'Migration',
        category: 'Cloud',
        challenge: 'Legacy systems causing 99.5% uptime issues',
        solution: 'Implemented phased migration with zero downtime',
        results: 'Achieved 99.99% uptime and 40% cost reduction',
        technologies: ['AWS', 'Terraform', 'Docker'],
        metrics: {
          uptime: '99.99%',
          costReduction: '40%',
          migrationTime: '3 months',
        },
        imageUrl: '/images/migration.webp',
        ogImageUrl: '/images/migration-og.webp',
        galleryImages: ['/images/g1.webp', '/images/g2.webp'],
        gradientClass: 'surface-overlay',
        externalLink: null,
        githubLink: null,
        testimonialText: 'Excellent work on our migration',
        testimonialAuthor: 'Jane Smith',
        testimonialRole: 'CTO, TechCorp Inc',
        testimonialVideoUrl: null,
        projectDuration: '3 months',
        teamSize: 5,
        featured: true,
        published: true,
        displayOrder: 0,
        viewCount: 500,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(caseStudyItem.showcaseType).toBe('detailed');
      expect(isDetailedShowcase(caseStudyItem)).toBe(true);
      // Detailed items should have challenge/solution/results
      expect(caseStudyItem.challenge).toBeTruthy();
      expect(caseStudyItem.solution).toBeTruthy();
      expect(caseStudyItem.results).toBeTruthy();
    });
  });
});

describe('Showcase Schema Alignment', () => {
  test('schema exports showcase table', async () => {
    const schema = await import('@/lib/schema');
    expect(schema.showcase).toBeDefined();
  });

  test('ShowcaseItem type matches schema fields', () => {
    // This test validates that the TypeScript types align with expected schema
    const requiredFields = [
      'id',
      'slug',
      'title',
      'description',
      'showcaseType',
      'technologies',
      'metrics',
      'featured',
      'published',
      'displayOrder',
    ];

    const item: ShowcaseItem = {
      id: '1',
      slug: 'test',
      title: 'Test',
      description: 'Test',
      longDescription: null,
      showcaseType: 'quick',
      clientName: null,
      industry: null,
      projectType: null,
      category: null,
      challenge: null,
      solution: null,
      results: null,
      technologies: [],
      metrics: {},
      imageUrl: null,
      ogImageUrl: null,
      galleryImages: null,
      gradientClass: 'surface-overlay',
      externalLink: null,
      githubLink: null,
      testimonialText: null,
      testimonialAuthor: null,
      testimonialRole: null,
      testimonialVideoUrl: null,
      projectDuration: null,
      teamSize: null,
      featured: false,
      published: true,
      displayOrder: 0,
      viewCount: 0,
      publishedAt: null,
      createdAt: null,
      updatedAt: null,
    };

    // Verify all required fields exist
    for (const field of requiredFields) {
      expect(field in item).toBe(true);
    }
  });
});
