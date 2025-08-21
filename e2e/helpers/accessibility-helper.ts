import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { AxeResults, AxeViolation, AxeNode } from '@/types/test';

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
  }>;
}

export interface AccessibilityOptions {
  includeTags?: string[];
  excludeTags?: string[];
  rules?: Record<string, { enabled: boolean }>;
  runOnly?: string[];
}

export class AccessibilityHelper {
  private page: Page;
  private isAxeInjected: boolean = false;

  constructor(page: Page) {
    this.page = page;
  }

  async injectAxe() {
    if (this.isAxeInjected) return;
    
    try {
      // AxeBuilder automatically injects axe when analyze() is called
      this.isAxeInjected = true;
    } catch (error) {
      console.warn('Failed to inject axe-core:', error);
    }
  }

  async configureAxe(options: AccessibilityOptions) {
    if (!this.isAxeInjected) {
      await this.injectAxe();
    }
    // Configuration is now handled in individual check methods
  }

  async checkAccessibility(
    selector?: string,
    options: AccessibilityOptions = {}
  ): Promise<AccessibilityViolation[]> {
    try {
      let axeBuilder = new AxeBuilder({ page: this.page });

      // Configure tags
      if (options.includeTags) {
        axeBuilder = axeBuilder.withTags(options.includeTags);
      } else {
        axeBuilder = axeBuilder.withTags(['wcag2a', 'wcag2aa', 'wcag21aa']);
      }

      // Configure rules
      if (options.rules) {
        Object.entries(options.rules).forEach(([ruleId, config]) => {
          if (config.enabled === false) {
            axeBuilder = axeBuilder.disableRules([ruleId]);
          }
        });
      }

      // Run only specific rules if specified
      if (options.runOnly) {
        axeBuilder = axeBuilder.withRules(options.runOnly);
      }

      // Include or exclude specific elements
      if (selector) {
        axeBuilder = axeBuilder.include(selector);
      }

      const results = await axeBuilder.analyze();

      return results.violations.map((violation: AxeViolation) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        tags: violation.tags,
        nodes: violation.nodes.map((node: AxeNode) => ({
          html: node.html,
          target: node.target,
          failureSummary: node.failureSummary
        }))
      }));
    } catch (error) {
      console.warn('Accessibility check failed:', error);
      return [];
    }
  }

  async checkCriticalAccessibility(selector?: string): Promise<AccessibilityViolation[]> {
    const violations = await this.checkAccessibility(selector, {
      includeTags: ['wcag2a', 'wcag2aa']
    });

    return violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
  }

  // Specific accessibility checks
  async checkHeadingStructure(): Promise<{ valid: boolean; issues: string[] }> {
    const headingData = await this.page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return headings.map(h => ({
        level: parseInt(h.tagName.substring(1)),
        text: h.textContent?.trim() || '',
        id: h.id || null
      }));
    });

    const issues: string[] = [];
    
    // Check for single h1
    const h1Count = headingData.filter(h => h.level === 1).length;
    if (h1Count === 0) {
      issues.push('Page should have exactly one h1 element');
    } else if (h1Count > 1) {
      issues.push(`Page has ${h1Count} h1 elements, should have only one`);
    }

    // Check heading hierarchy
    for (let i = 1; i < headingData.length; i++) {
      const current = headingData[i];
      const previous = headingData[i - 1];
      
      if (current.level > previous.level + 1) {
        issues.push(`Heading hierarchy skipped from h${previous.level} to h${current.level}`);
      }
    }

    // Check for empty headings
    const emptyHeadings = headingData.filter(h => !h.text);
    if (emptyHeadings.length > 0) {
      issues.push(`${emptyHeadings.length} empty heading(s) found`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  async checkFormAccessibility(): Promise<{ valid: boolean; issues: string[] }> {
    const formData = await this.page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form'));
      const issues: string[] = [];
      
      forms.forEach((form, formIndex) => {
        // Check form has accessible name
        const formLabel = form.getAttribute('aria-label') || 
                         form.getAttribute('aria-labelledby') ||
                         form.querySelector('legend, h1, h2, h3, h4, h5, h6');
        if (!formLabel) {
          issues.push(`Form ${formIndex + 1} lacks accessible name`);
        }

        // Check form controls
        const controls = form.querySelectorAll('input, textarea, select');
        controls.forEach((control, controlIndex) => {
          const id = control.id;
          const name = control.getAttribute('name');
          const ariaLabel = control.getAttribute('aria-label');
          const ariaLabelledby = control.getAttribute('aria-labelledby');
          const label = id ? form.querySelector(`label[for="${id}"]`) : null;
          
          if (!label && !ariaLabel && !ariaLabelledby) {
            issues.push(`Form ${formIndex + 1}, control ${controlIndex + 1} (${control.tagName}) lacks accessible label`);
          }

          // Check required fields have indication
          if (control.hasAttribute('required')) {
            const hasRequiredIndicator = 
              control.getAttribute('aria-required') === 'true' ||
              label?.textContent?.includes('*') ||
              label?.textContent?.toLowerCase().includes('required');
            
            if (!hasRequiredIndicator) {
              issues.push(`Required field in form ${formIndex + 1} lacks clear indication`);
            }
          }

          // Check error states
          if (control.getAttribute('aria-invalid') === 'true') {
            const errorId = control.getAttribute('aria-describedby');
            if (!errorId || !form.querySelector(`#${errorId}`)) {
              issues.push(`Invalid field in form ${formIndex + 1} lacks error description`);
            }
          }
        });

        // Check submit button
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) {
          const buttonText = submitButton.textContent?.trim() || 
                           submitButton.getAttribute('value') ||
                           submitButton.getAttribute('aria-label');
          if (!buttonText) {
            issues.push(`Submit button in form ${formIndex + 1} lacks accessible text`);
          }
        }
      });

      return issues;
    });

    return {
      valid: formData.length === 0,
      issues: formData
    };
  }

  async checkImageAccessibility(): Promise<{ valid: boolean; issues: string[] }> {
    const imageData = await this.page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const issues: string[] = [];
      
      images.forEach((img, index) => {
        const alt = img.getAttribute('alt');
        const ariaLabel = img.getAttribute('aria-label');
        const role = img.getAttribute('role');
        const ariaHidden = img.getAttribute('aria-hidden');
        
        // Decorative images
        if (role === 'presentation' || ariaHidden === 'true' || alt === '') {
          return; // OK for decorative images
        }
        
        // Content images need alt text
        if (!alt && !ariaLabel) {
          issues.push(`Image ${index + 1} (${img.src}) lacks alt text`);
        }
        
        // Check for meaningful alt text
        if (alt && (alt.toLowerCase().includes('image') || alt.toLowerCase().includes('picture'))) {
          issues.push(`Image ${index + 1} has generic alt text: "${alt}"`);
        }
      });

      return issues;
    });

    return {
      valid: imageData.length === 0,
      issues: imageData
    };
  }

  async checkLinkAccessibility(): Promise<{ valid: boolean; issues: string[] }> {
    const linkData = await this.page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const issues: string[] = [];
      
      links.forEach((link, index) => {
        const text = link.textContent?.trim();
        const ariaLabel = link.getAttribute('aria-label');
        const title = link.getAttribute('title');
        const href = link.getAttribute('href');
        
        // Check for accessible name
        if (!text && !ariaLabel && !title) {
          issues.push(`Link ${index + 1} lacks accessible text`);
        }
        
        // Check for generic link text
        if (text && ['click here', 'read more', 'more', 'here', 'link'].includes(text.toLowerCase())) {
          issues.push(`Link ${index + 1} has generic text: "${text}"`);
        }
        
        // Check external links
        if (href && (href.startsWith('http') && !href.includes(window.location.hostname))) {
          const hasExternalIndicator = 
            ariaLabel?.toLowerCase().includes('external') ||
            text?.toLowerCase().includes('external') ||
            link.querySelector('[aria-label*="external" i]');
          
          if (!hasExternalIndicator) {
            issues.push(`External link ${index + 1} lacks indication that it opens in new tab/window`);
          }
        }
      });

      return issues;
    });

    return {
      valid: linkData.length === 0,
      issues: linkData
    };
  }

  async checkColorContrast(): Promise<{ valid: boolean; issues: string[] }> {
    const violations = await this.checkAccessibility(undefined, {
      runOnly: ['color-contrast']
    });

    const issues = violations.map(v => 
      `Color contrast issue: ${v.description} (${v.nodes.length} element(s))`
    );

    return {
      valid: violations.length === 0,
      issues
    };
  }

  async checkKeyboardNavigation(): Promise<{ valid: boolean; issues: string[] }> {
    const navigationData = await this.page.evaluate(() => {
      const issues: string[] = [];
      const focusableElements = document.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      
      let tabOrder: number[] = [];
      focusableElements.forEach((el, index) => {
        const tabIndex = el.getAttribute('tabindex');
        if (tabIndex && parseInt(tabIndex) > 0) {
          tabOrder.push(parseInt(tabIndex));
        }
      });
      
      // Check for tab index issues
      if (tabOrder.length > 0) {
        const sortedTabOrder = [...tabOrder].sort((a, b) => a - b);
        if (JSON.stringify(tabOrder) !== JSON.stringify(sortedTabOrder)) {
          issues.push('Tab order may be confusing due to positive tabindex values');
        }
      }
      
      // Check for focus indicators
      const style = document.createElement('style');
      style.textContent = '*:focus { outline: 2px solid red !important; }';
      document.head.appendChild(style);
      
      return issues;
    });

    return {
      valid: navigationData.length === 0,
      issues: navigationData
    };
  }

  async checkARIAUsage(): Promise<{ valid: boolean; issues: string[] }> {
    const violations = await this.checkAccessibility(undefined, {
      includeTags: ['wcag2a', 'wcag2aa'],
      runOnly: ['aria-allowed-attr', 'aria-required-attr', 'aria-valid-attr-value']
    });

    const issues = violations.map(v => 
      `ARIA issue: ${v.description} (${v.nodes.length} element(s))`
    );

    return {
      valid: violations.length === 0,
      issues
    };
  }

  // Comprehensive accessibility audit
  async runFullAccessibilityAudit(): Promise<{
    overall: { valid: boolean; score: number };
    details: {
      headings: { valid: boolean; issues: string[] };
      forms: { valid: boolean; issues: string[] };
      images: { valid: boolean; issues: string[] };
      links: { valid: boolean; issues: string[] };
      colorContrast: { valid: boolean; issues: string[] };
      keyboard: { valid: boolean; issues: string[] };
      aria: { valid: boolean; issues: string[] };
    };
    violations: AccessibilityViolation[];
  }> {
    // Run checks sequentially to avoid axe-core conflicts
    const headings = await this.checkHeadingStructure();
    const forms = await this.checkFormAccessibility();
    const images = await this.checkImageAccessibility();
    const links = await this.checkLinkAccessibility();
    
    // Run axe-based checks sequentially with small delays
    const colorContrast = await this.checkColorContrast();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const keyboard = await this.checkKeyboardNavigation();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const aria = await this.checkARIAUsage();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const violations = await this.checkCriticalAccessibility();

    const details = {
      headings,
      forms,
      images,
      links,
      colorContrast,
      keyboard,
      aria
    };

    // Calculate overall score
    const totalChecks = Object.keys(details).length;
    const passedChecks = Object.values(details).filter(check => check.valid).length;
    const score = Math.round((passedChecks / totalChecks) * 100);
    const hasCriticalViolations = violations.length > 0;

    return {
      overall: {
        valid: score === 100 && !hasCriticalViolations,
        score
      },
      details,
      violations
    };
  }

  // Generate accessibility report
  async generateAccessibilityReport(): Promise<string> {
    const audit = await this.runFullAccessibilityAudit();
    
    let report = `
Accessibility Audit Report
==========================
Overall Score: ${audit.overall.score}%
Status: ${audit.overall.valid ? 'PASS' : 'FAIL'}

Detailed Results:
`;

    Object.entries(audit.details).forEach(([category, result]) => {
      report += `\n${category.toUpperCase()}: ${result.valid ? 'PASS' : 'FAIL'}\n`;
      if (result.issues.length > 0) {
        result.issues.forEach(issue => {
          report += `  - ${issue}\n`;
        });
      }
    });

    if (audit.violations.length > 0) {
      report += `\nCritical Violations:\n`;
      audit.violations.forEach(violation => {
        report += `  - ${violation.description} (${violation.impact})\n`;
        report += `    Help: ${violation.help}\n`;
        report += `    Elements: ${violation.nodes.length}\n`;
      });
    }

    return report.trim();
  }

  // Utility methods for testing
  async simulateKeyboardNavigation(): Promise<boolean> {
    try {
      // Tab through focusable elements
      const focusableCount = await this.page.evaluate(() => {
        return document.querySelectorAll(
          'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        ).length;
      });

      for (let i = 0; i < Math.min(focusableCount, 10); i++) {
        await this.page.keyboard.press('Tab');
        await this.page.waitForTimeout(100);
        
        // Check if element is properly focused
        const focusedElement = await this.page.evaluate(() => {
          const focused = document.activeElement;
          return focused ? {
            tagName: focused.tagName,
            visible: focused.offsetParent !== null
          } : null;
        });

        if (!focusedElement?.visible) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.warn('Keyboard navigation test failed:', error);
      return false;
    }
  }

  async testScreenReader(): Promise<{ accessible: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    // Check for screen reader only content
    const srOnlyElements = await this.page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('.sr-only, .screen-reader-only, .visually-hidden'));
      return elements.map(el => ({
        text: el.textContent?.trim() || '',
        hasContent: !!el.textContent?.trim()
      }));
    });

    // Check landmarks
    const landmarks = await this.page.evaluate(() => {
      const landmarkElements = document.querySelectorAll('main, nav, aside, header, footer, [role="main"], [role="navigation"], [role="complementary"], [role="banner"], [role="contentinfo"]');
      return landmarkElements.length;
    });

    if (landmarks === 0) {
      issues.push('No landmark elements found - screen readers rely on landmarks for navigation');
    }

    return {
      accessible: issues.length === 0,
      issues
    };
  }
}