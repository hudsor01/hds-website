/**
 * Production Readiness Tests
 * Validates that the codebase is ready for production deployment
 * Tests critical paths: routes, schemas, tools, and core functionality
 */
import { describe, test, expect } from 'bun:test';
import { existsSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = process.cwd();

describe('Production Readiness: Route Structure', () => {
  describe('Showcase Routes (Unified Portfolio + Case Studies)', () => {
    test('/showcase page exists', () => {
      const pagePath = join(ROOT_DIR, 'src/app/showcase/page.tsx');
      expect(existsSync(pagePath)).toBe(true);
    });

    test('/showcase/[slug] dynamic route exists', () => {
      const pagePath = join(ROOT_DIR, 'src/app/showcase/[slug]/page.tsx');
      expect(existsSync(pagePath)).toBe(true);
    });

    test('/showcase loading state exists', () => {
      const loadingPath = join(ROOT_DIR, 'src/app/showcase/loading.tsx');
      expect(existsSync(loadingPath)).toBe(true);
    });

    test('old /portfolio route removed', () => {
      const oldPath = join(ROOT_DIR, 'src/app/portfolio');
      expect(existsSync(oldPath)).toBe(false);
    });

    test('old /case-studies route removed', () => {
      const oldPath = join(ROOT_DIR, 'src/app/case-studies');
      expect(existsSync(oldPath)).toBe(false);
    });
  });

  describe('Core Tool Routes (6 Tools)', () => {
    const tools = [
      'paystub-generator',
      'invoice-generator',
      'contract-generator',
      'texas-ttl-calculator',
      'mortgage-calculator',
      'tip-calculator',
    ];

    for (const tool of tools) {
      test(`/${tool} page exists`, () => {
        const pagePath = join(ROOT_DIR, `src/app/(tools)/${tool}/page.tsx`);
        expect(existsSync(pagePath)).toBe(true);
      });
    }
  });

  describe('Removed Routes (Consolidation)', () => {
    const removedRoutes = [
      'src/app/industries',
      'src/app/locations',
      'src/app/resources',
      'src/app/roi-calculator',
      'src/app/cost-estimator',
      'src/app/performance-calculator',
      'src/app/json-formatter',
      'src/app/password-generator',
      'src/app/meta-tag-generator',
      'src/app/testimonial-collector',
      'src/app/proposal-generator',
    ];

    for (const route of removedRoutes) {
      test(`${route} removed`, () => {
        const path = join(ROOT_DIR, route);
        expect(existsSync(path)).toBe(false);
      });
    }
  });

  describe('Essential Pages', () => {
    const essentialPages = [
      'src/app/page.tsx', // Homepage
      'src/app/about/page.tsx',
      'src/app/services/page.tsx',
      'src/app/pricing/page.tsx',
      'src/app/contact/page.tsx',
      'src/app/testimonials/page.tsx',
      'src/app/blog/page.tsx',
      'src/app/privacy/page.tsx',
    ];

    for (const page of essentialPages) {
      test(`${page} exists`, () => {
        const pagePath = join(ROOT_DIR, page);
        expect(existsSync(pagePath)).toBe(true);
      });
    }
  });
});

describe('Production Readiness: Data Layer', () => {
  describe('Showcase Data Layer', () => {
    test('showcase.ts exists', () => {
      const path = join(ROOT_DIR, 'src/lib/showcase.ts');
      expect(existsSync(path)).toBe(true);
    });

    test('old projects.ts removed', () => {
      const path = join(ROOT_DIR, 'src/lib/projects.ts');
      expect(existsSync(path)).toBe(false);
    });

    test('old case-studies.ts removed', () => {
      const path = join(ROOT_DIR, 'src/lib/case-studies.ts');
      expect(existsSync(path)).toBe(false);
    });
  });

  describe('Schema Files', () => {
    test('showcase schema exists', () => {
      const path = join(ROOT_DIR, 'src/lib/schema/showcase.ts');
      expect(existsSync(path)).toBe(true);
    });

    test('old projects schema removed', () => {
      const path = join(ROOT_DIR, 'src/lib/schema/projects.ts');
      expect(existsSync(path)).toBe(false);
    });

    test('schema index exports showcase', async () => {
      const schema = await import('@/lib/schema');
      expect(schema.showcase).toBeDefined();
    });
  });
});

describe('Production Readiness: Dependencies', () => {
  test('no Supabase packages in dependencies', async () => {
    const packageJson = await import('../../package.json');
    const deps = packageJson.dependencies || {};
    const devDeps = packageJson.devDependencies || {};
    const allDeps = { ...deps, ...devDeps };

    expect('@supabase/supabase-js' in allDeps).toBe(false);
    expect('@supabase/ssr' in allDeps).toBe(false);
  });

  test('Drizzle ORM is installed', async () => {
    const packageJson = await import('../../package.json');
    const deps = packageJson.dependencies || {};
    expect('drizzle-orm' in deps).toBe(true);
  });

  test('Neon database package is installed', async () => {
    const packageJson = await import('../../package.json');
    const deps = packageJson.dependencies || {};
    expect('@neondatabase/serverless' in deps).toBe(true);
  });
});

describe('Production Readiness: Core Components', () => {
  describe('Layout Components', () => {
    test('Navbar exists', () => {
      const path = join(ROOT_DIR, 'src/components/layout/Navbar.tsx');
      expect(existsSync(path)).toBe(true);
    });

    test('Footer exists', () => {
      const path = join(ROOT_DIR, 'src/components/layout/Footer.tsx');
      expect(existsSync(path)).toBe(true);
    });
  });

  describe('Card Components', () => {
    test('project-card exists', () => {
      const path = join(ROOT_DIR, 'src/components/project-card.tsx');
      expect(existsSync(path)).toBe(true);
    });

    test('unified Card component exists', () => {
      const path = join(ROOT_DIR, 'src/components/ui/card.tsx');
      expect(existsSync(path)).toBe(true);
    });
  });
});

describe('Production Readiness: API Routes', () => {
  describe('Essential API Routes', () => {
    const essentialApis = [
      'src/app/api/contact/route.ts',
      'src/app/api/health/route.ts',
      'src/app/api/testimonials/route.ts',
      'src/app/api/newsletter/route.ts',
    ];

    for (const api of essentialApis) {
      test(`${api} exists`, () => {
        const path = join(ROOT_DIR, api);
        expect(existsSync(path)).toBe(true);
      });
    }
  });

  describe('Removed API Routes', () => {
    test('old case-studies API removed', () => {
      const path = join(ROOT_DIR, 'src/app/api/case-studies');
      expect(existsSync(path)).toBe(false);
    });

    test('old admin case-studies API removed', () => {
      const path = join(ROOT_DIR, 'src/app/api/admin/case-studies');
      expect(existsSync(path)).toBe(false);
    });
  });
});

describe('Production Readiness: Configuration', () => {
  test('drizzle.config.ts exists', () => {
    const path = join(ROOT_DIR, 'drizzle.config.ts');
    expect(existsSync(path)).toBe(true);
  });

  test('next.config.ts exists', () => {
    // Check for both .ts and .js variants
    const tsPath = join(ROOT_DIR, 'next.config.ts');
    const jsPath = join(ROOT_DIR, 'next.config.js');
    const mjsPath = join(ROOT_DIR, 'next.config.mjs');
    expect(existsSync(tsPath) || existsSync(jsPath) || existsSync(mjsPath)).toBe(true);
  });

  test('PostCSS config exists (Tailwind v4)', () => {
    // Tailwind v4 uses PostCSS config instead of tailwind.config
    const mjsPath = join(ROOT_DIR, 'postcss.config.mjs');
    const jsPath = join(ROOT_DIR, 'postcss.config.js');
    expect(existsSync(mjsPath) || existsSync(jsPath)).toBe(true);
  });
});
