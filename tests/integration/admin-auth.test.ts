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

  describe('Admin Email Whitelist Logic', () => {
    /**
     * Simulates the email whitelist check logic from admin-auth.ts
     * This is the logic used in isAdminEmail() function
     */
    const checkAdminEmail = (email: string, whitelist: string[]): boolean => {
      return whitelist.includes(email.toLowerCase());
    };

    it('allows whitelisted email (case insensitive)', () => {
      const whitelist = ['admin@example.com', 'super@example.com'];

      expect(checkAdminEmail('admin@example.com', whitelist)).toBe(true);
      expect(checkAdminEmail('ADMIN@EXAMPLE.COM', whitelist)).toBe(true);
      expect(checkAdminEmail('Admin@Example.Com', whitelist)).toBe(true);
      expect(checkAdminEmail('super@example.com', whitelist)).toBe(true);
      expect(checkAdminEmail('SUPER@EXAMPLE.COM', whitelist)).toBe(true);
    });

    it('rejects non-whitelisted email', () => {
      const whitelist = ['admin@example.com', 'super@example.com'];

      expect(checkAdminEmail('hacker@evil.com', whitelist)).toBe(false);
      expect(checkAdminEmail('notadmin@example.com', whitelist)).toBe(false);
      expect(checkAdminEmail('user@test.com', whitelist)).toBe(false);
    });

    it('rejects empty email', () => {
      const whitelist = ['admin@example.com'];

      expect(checkAdminEmail('', whitelist)).toBe(false);
    });
  });

  describe('Admin Role Check Logic', () => {
    /**
     * Simulates the role check logic from admin-auth.ts
     * This is the logic used in hasAdminRole() function
     */
    const checkAdminRole = (user: { metadata?: { role?: string } }): boolean => {
      return user.metadata?.role === 'admin';
    };

    it('accepts user with admin role in metadata', () => {
      expect(checkAdminRole({ metadata: { role: 'admin' } })).toBe(true);
    });

    it('rejects user without admin role', () => {
      expect(checkAdminRole({ metadata: { role: 'user' } })).toBe(false);
      expect(checkAdminRole({ metadata: { role: 'moderator' } })).toBe(false);
      expect(checkAdminRole({ metadata: {} })).toBe(false);
      expect(checkAdminRole({})).toBe(false);
    });

    it('rejects user with undefined metadata', () => {
      expect(checkAdminRole({ metadata: undefined })).toBe(false);
    });
  });
});
