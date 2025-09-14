import { describe, test, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tailwind CSS Utility Classes', () => {
  let globalsCss: string;

  beforeAll(() => {
    const cssPath = path.join(process.cwd(), 'src/app/globals.css');
    globalsCss = fs.readFileSync(cssPath, 'utf-8');
  });

  describe('Scrollbar Hide Utility', () => {
    test('should have scrollbar-hide utility class defined', () => {
      expect(globalsCss).toContain('.scrollbar-hide');
    });

    test('should hide scrollbar for webkit browsers', () => {
      expect(globalsCss).toContain('.scrollbar-hide::-webkit-scrollbar');
      expect(globalsCss).toContain('display: none');
    });

    test('should hide scrollbar for Firefox', () => {
      expect(globalsCss).toContain('scrollbar-width: none');
    });

    test('should hide scrollbar for IE and Edge', () => {
      expect(globalsCss).toContain('-ms-overflow-style: none');
    });
  });

  describe('Motion Preferences Support', () => {
    test('should have prefers-reduced-motion media query', () => {
      expect(globalsCss).toContain('@media (prefers-reduced-motion: reduce)');
    });

    test('should reduce animation duration for reduced motion', () => {
      expect(globalsCss).toContain('animation-duration: 0.01ms !important');
    });

    test('should reduce transition duration for reduced motion', () => {
      expect(globalsCss).toContain('transition-duration: 0.01ms !important');
    });

    test('should disable scroll behavior for reduced motion', () => {
      expect(globalsCss).toContain('scroll-behavior: auto !important');
    });

    test('should reset will-change for reduced motion', () => {
      expect(globalsCss).toContain('.will-change-transform');
      expect(globalsCss).toContain('will-change: auto !important');
    });

    test('should disable hover scales for reduced motion', () => {
      expect(globalsCss).toContain('.hover\\:scale-105:hover');
      expect(globalsCss).toContain('.hover\\:scale-110:hover');
      expect(globalsCss).toContain('transform: none !important');
    });

    test('should disable pulse animation for reduced motion', () => {
      expect(globalsCss).toContain('.animate-pulse');
      expect(globalsCss).toContain('animation: none !important');
    });
  });

  describe('Custom Gradient Classes', () => {
    test('should have gradient utility classes', () => {
      expect(globalsCss).toContain('.bg-gradient-to-r');
      expect(globalsCss).toContain('linear-gradient(to right');
    });

    test('should have gradient-hero class', () => {
      expect(globalsCss).toContain('.bg-gradient-hero');
    });

    test('should have gradient-primary class', () => {
      expect(globalsCss).toContain('.bg-gradient-primary');
    });

    test('should have gradient-secondary class', () => {
      expect(globalsCss).toContain('.bg-gradient-secondary');
    });
  });

  describe('Glass Morphism Effects', () => {
    test('should have glass-card class', () => {
      expect(globalsCss).toContain('.glass-card');
      expect(globalsCss).toContain('backdrop-blur');
    });

    test('should have glass-morphism class', () => {
      expect(globalsCss).toContain('.glass-morphism');
    });
  });

  describe('Responsive Text Classes', () => {
    test('should have responsive text utilities', () => {
      expect(globalsCss).toContain('.text-responsive-sm');
      expect(globalsCss).toContain('.text-responsive-md');
      expect(globalsCss).toContain('.text-responsive-lg');
    });

    test('should scale text based on viewport', () => {
      expect(globalsCss).toContain('@media (min-width: 768px)');
      expect(globalsCss).toContain('@media (min-width: 1024px)');
    });
  });
});

describe('Component Class Usage', () => {
  describe('Text Balance and Pretty', () => {
    test('should use text-balance in heading components', () => {
      const files = [
        'src/app/about/page.tsx',
        'src/app/pricing/page.tsx',
        'src/app/blog/page.tsx',
        'src/app/contact/page.tsx'
      ];

      files.forEach(file => {
        const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
        expect(content).toMatch(/text-balance/);
      });
    });

    test('should use text-pretty in description paragraphs', () => {
      const files = [
        'src/app/about/page.tsx',
        'src/app/pricing/page.tsx',
        'src/app/blog/page.tsx'
      ];

      files.forEach(file => {
        const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
        expect(content).toMatch(/text-pretty/);
      });
    });
  });

  describe('Will-Change Optimizations', () => {
    test('should use will-change-transform on animated elements', () => {
      const files = [
        'src/app/services/page.tsx',
        'src/app/portfolio/page.tsx',
        'src/components/ContactForm.tsx',
        'src/components/ScrollToTop.tsx'
      ];

      files.forEach(file => {
        const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
        expect(content).toMatch(/will-change-transform/);
      });
    });
  });

  describe('Scroll Snap Implementation', () => {
    test('should use snap classes in scrollable sections', () => {
      const files = [
        'src/app/portfolio/page.tsx',
        'src/app/testimonials/page.tsx',
        'src/app/blog/page.tsx'
      ];

      files.forEach(file => {
        const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
        expect(content).toMatch(/snap-x|snap-center|snap-mandatory/);
      });
    });

    test('should use scrollbar-hide for mobile scroll containers', () => {
      const files = [
        'src/app/portfolio/page.tsx',
        'src/app/testimonials/page.tsx'
      ];

      files.forEach(file => {
        const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
        expect(content).toMatch(/scrollbar-hide/);
      });
    });
  });

  describe('Form Accessibility', () => {
    test('should use accent-cyan-500 on form inputs', () => {
      const contactForm = fs.readFileSync(
        path.join(process.cwd(), 'src/components/ContactForm.tsx'),
        'utf-8'
      );

      // Count occurrences of accent-cyan-500
      const matches = contactForm.match(/accent-cyan-500/g);
      expect(matches).toBeTruthy();
      expect(matches!.length).toBeGreaterThanOrEqual(5); // Should be on multiple inputs
    });
  });

  describe('Smooth Scrolling', () => {
    test('should have scroll-smooth on HTML element', () => {
      const layout = fs.readFileSync(
        path.join(process.cwd(), 'src/app/layout.tsx'),
        'utf-8'
      );

      expect(layout).toContain('className="scroll-smooth"');
    });

    test('should include ScrollToTop component in layout', () => {
      const layout = fs.readFileSync(
        path.join(process.cwd(), 'src/app/layout.tsx'),
        'utf-8'
      );

      expect(layout).toContain('import ScrollToTop');
      expect(layout).toContain('<ScrollToTop />');
    });
  });
});