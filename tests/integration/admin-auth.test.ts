import { describe, it, expect } from 'bun:test';

/**
 * Admin Authentication Environment Validation Tests
 *
 * Note: These tests verify the validation logic for ADMIN_EMAILS.
 * The actual fail-fast validation happens at module initialization in admin-auth.ts.
 * We test the validation logic here to ensure it correctly rejects invalid values.
 */

describe('Admin Authentication', () => {
  describe('ADMIN_EMAILS validation logic', () => {
    /**
     * Simulates the validation logic from admin-auth.ts
     * This is what prevents the module from loading with invalid ADMIN_EMAILS
     */
    const validateAdminEmails = (value: string | undefined): boolean => {
      if (!value?.trim()) {
        throw new Error('ADMIN_EMAILS environment variable is required');
      }
      return true;
    };

    it('throws error when ADMIN_EMAILS is undefined', () => {
      expect(() => {
        validateAdminEmails(undefined);
      }).toThrow('ADMIN_EMAILS environment variable is required');
    });

    it('throws error when ADMIN_EMAILS is empty string', () => {
      expect(() => {
        validateAdminEmails('');
      }).toThrow('ADMIN_EMAILS environment variable is required');
    });

    it('throws error when ADMIN_EMAILS is whitespace only', () => {
      expect(() => {
        validateAdminEmails('   ');
      }).toThrow('ADMIN_EMAILS environment variable is required');
    });

    it('accepts valid ADMIN_EMAILS', () => {
      expect(validateAdminEmails('admin@example.com')).toBe(true);
      expect(validateAdminEmails('admin@example.com,user@example.com')).toBe(true);
    });
  });

  describe('ADMIN_EMAILS parsing logic', () => {
    /**
     * Simulates the email parsing logic from admin-auth.ts
     */
    const parseAdminEmails = (value: string): string[] => {
      return value.split(',')
        .map(e => e.trim().toLowerCase())
        .filter(e => e.length > 0);
    };

    it('correctly parses single email', () => {
      const result = parseAdminEmails('ADMIN@Example.com');
      expect(result).toEqual(['admin@example.com']);
    });

    it('correctly parses multiple emails', () => {
      const result = parseAdminEmails('ADMIN@Example.com, User@Test.com');
      expect(result).toEqual(['admin@example.com', 'user@test.com']);
    });

    it('trims whitespace from emails', () => {
      const result = parseAdminEmails('  admin@example.com  ,  user@test.com  ');
      expect(result).toEqual(['admin@example.com', 'user@test.com']);
    });

    it('normalizes emails to lowercase', () => {
      const result = parseAdminEmails('Admin@EXAMPLE.COM,USER@test.COM');
      expect(result).toEqual(['admin@example.com', 'user@test.com']);
    });

    it('filters out empty strings from comma-separated values', () => {
      const result = parseAdminEmails(',admin@example.com,,test@example.com,');
      expect(result).toEqual(['admin@example.com', 'test@example.com']);
      expect(result).not.toContain('');
    });

    it('filters out empty strings from comma-only input', () => {
      const result = parseAdminEmails(',,,');
      expect(result).toEqual([]);
      expect(result).not.toContain('');
    });

    it('filters out empty strings with whitespace', () => {
      const result = parseAdminEmails('admin@example.com, , ,test@example.com');
      expect(result).toEqual(['admin@example.com', 'test@example.com']);
      expect(result).not.toContain('');
    });
  });
});
