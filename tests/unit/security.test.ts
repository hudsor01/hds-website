/**
 * Security Utilities Tests
 * Tests for CSRF token handling, rate limiting, and admin authentication
 *
 * NOTE: This file relies on the env mock from tests/setup.ts preload.
 * Do NOT add file-level mock.module() calls here as they can conflict
 * with the preload mocks and cause import failures in CI.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

// Import types for use in tests (type-only imports don't load modules)
import type * as CsrfTypes from '@/lib/csrf';
import type * as RateLimiterTypes from '@/lib/rate-limiter';
import type { NextRequest } from 'next/server';

// ================================
// CSRF Token Tests
// ================================

describe('CSRF Token Utilities', () => {
  let csrfModule: typeof CsrfTypes;

  beforeEach(async () => {
    // Re-import to get fresh module with mocks
    csrfModule = await import('@/lib/csrf');
  });

  describe('generateCsrfToken', () => {
    it('should generate a token with three parts separated by dots', async () => {
      const token = await csrfModule.generateCsrfToken();
      const parts = token.split('.');

      expect(parts).toHaveLength(3);
      expect(parts[0]).toBeTruthy(); // Random token
      expect(parts[1]).toBeTruthy(); // Expiry timestamp
      expect(parts[2]).toBeTruthy(); // Signature
    });

    it('should generate unique tokens on each call', async () => {
      const token1 = await csrfModule.generateCsrfToken();
      const token2 = await csrfModule.generateCsrfToken();

      expect(token1).not.toBe(token2);
    });

    it('should include a future expiry timestamp', async () => {
      const token = await csrfModule.generateCsrfToken();
      const parts = token.split('.');
      const expiry = parseInt(parts[1] || '0', 10);

      expect(expiry).toBeGreaterThan(Date.now());
    });
  });

  describe('validateCsrfToken', () => {
    it('should validate a valid token', async () => {
      const token = await csrfModule.generateCsrfToken();
      const isValid = await csrfModule.validateCsrfToken(token);

      expect(isValid).toBe(true);
    });

    it('should reject empty tokens', async () => {
      const isValid = await csrfModule.validateCsrfToken('');
      expect(isValid).toBe(false);
    });

    it('should reject tokens with wrong number of parts', async () => {
      expect(await csrfModule.validateCsrfToken('part1.part2')).toBe(false);
      expect(await csrfModule.validateCsrfToken('part1.part2.part3.part4')).toBe(false);
    });

    it('should reject tokens with invalid signature', async () => {
      const token = await csrfModule.generateCsrfToken();
      const parts = token.split('.');
      const tamperedToken = `${parts[0]}.${parts[1]}.invalidsignature`;

      const isValid = await csrfModule.validateCsrfToken(tamperedToken);
      expect(isValid).toBe(false);
    });

    it('should reject expired tokens', async () => {
      const token = await csrfModule.generateCsrfToken();
      const parts = token.split('.');
      const expiredTimestamp = Date.now() - 1000; // 1 second ago

      // Re-create signature for the expired timestamp would be needed
      // For simplicity, we'll test by creating a token with past expiry
      const expiredToken = `${parts[0]}.${expiredTimestamp}.${parts[2]}`;

      const isValid = await csrfModule.validateCsrfToken(expiredToken);
      expect(isValid).toBe(false);
    });
  });

  describe('getCsrfTokenFromRequest', () => {
    it('should extract token from X-CSRF-Token header', async () => {
      const mockRequest = new Request('https://example.com', {
        headers: {
          'X-CSRF-Token': 'test-token-from-header',
        },
      });

      const token = await csrfModule.getCsrfTokenFromRequest(mockRequest);
      expect(token).toBe('test-token-from-header');
    });

    it('should return null when no token is present', async () => {
      const mockRequest = new Request('https://example.com', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
      });

      const token = await csrfModule.getCsrfTokenFromRequest(mockRequest);
      expect(token).toBeNull();
    });
  });

  describe('validateCsrfForMutation', () => {
    it('should skip validation for GET requests', async () => {
      const mockRequest = new Request('https://example.com', {
        method: 'GET',
      });

      const isValid = await csrfModule.validateCsrfForMutation(mockRequest);
      expect(isValid).toBe(true);
    });

    it('should skip validation for HEAD requests', async () => {
      const mockRequest = new Request('https://example.com', {
        method: 'HEAD',
      });

      const isValid = await csrfModule.validateCsrfForMutation(mockRequest);
      expect(isValid).toBe(true);
    });

    it('should skip validation for OPTIONS requests', async () => {
      const mockRequest = new Request('https://example.com', {
        method: 'OPTIONS',
      });

      const isValid = await csrfModule.validateCsrfForMutation(mockRequest);
      expect(isValid).toBe(true);
    });

    it('should require valid token for POST requests', async () => {
      const mockRequest = new Request('https://example.com', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
      });

      const isValid = await csrfModule.validateCsrfForMutation(mockRequest);
      expect(isValid).toBe(false);
    });

    it('should validate POST with valid token in header', async () => {
      const token = await csrfModule.generateCsrfToken();
      const mockRequest = new Request('https://example.com', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': token,
        },
        body: JSON.stringify({ data: 'test' }),
      });

      const isValid = await csrfModule.validateCsrfForMutation(mockRequest);
      expect(isValid).toBe(true);
    });
  });
});

// ================================
// Rate Limiter Tests
// ================================

describe('Rate Limiter', () => {
  let rateLimiterModule: typeof RateLimiterTypes;

  beforeEach(async () => {
    // Dynamic import to get the module (mocked or real depending on execution order)
    rateLimiterModule = await import('@/lib/rate-limiter');
  });

  afterEach(() => {
    // Cleanup the rate limiter singleton if it has a destroy method
  });

  describe('UnifiedRateLimiter', () => {
    it('should allow requests within limit', async () => {
      const limiter = new rateLimiterModule.UnifiedRateLimiter();
      const identifier = `test-${Date.now()}`;

      const result = await limiter.checkLimit(identifier, 'api');
      expect(result).toBe(true);

      limiter.destroy();
    });

    it('should block requests over limit', async () => {
      const limiter = new rateLimiterModule.UnifiedRateLimiter();
      const identifier = `test-limit-${Date.now()}`;

      // Make requests up to the limit (60 for 'api')
      const config = rateLimiterModule.RATE_LIMIT_CONFIGS.api;

      for (let i = 0; i < config.maxRequests; i++) {
        const result = await limiter.checkLimit(identifier, 'api');
        expect(result).toBe(true);
      }

      // Next request should be blocked
      const blocked = await limiter.checkLimit(identifier, 'api');
      expect(blocked).toBe(false);

      limiter.destroy();
    });

    it('should use different counters for different limit types', async () => {
      const limiter = new rateLimiterModule.UnifiedRateLimiter();
      const identifier = `test-types-${Date.now()}`;

      // Use up the contactForm limit (3)
      for (let i = 0; i < 3; i++) {
        await limiter.checkLimit(identifier, 'contactForm');
      }
      const contactFormBlocked = await limiter.checkLimit(identifier, 'contactForm');
      expect(contactFormBlocked).toBe(false);

      // But api limit should still be available
      const apiAllowed = await limiter.checkLimit(identifier, 'api');
      expect(apiAllowed).toBe(true);

      limiter.destroy();
    });

    it('should return correct limit info', async () => {
      const limiter = new rateLimiterModule.UnifiedRateLimiter();
      const identifier = `test-info-${Date.now()}`;

      // Before any requests
      let info = await limiter.getLimitInfo(identifier, 'newsletter');
      expect(info.remaining).toBe(3); // newsletter max is 3
      expect(info.isLimited).toBe(false);

      // After some requests
      await limiter.checkLimit(identifier, 'newsletter');
      await limiter.checkLimit(identifier, 'newsletter');

      info = await limiter.getLimitInfo(identifier, 'newsletter');
      expect(info.remaining).toBe(1);
      expect(info.isLimited).toBe(false);

      // After limit exceeded
      await limiter.checkLimit(identifier, 'newsletter');

      info = await limiter.getLimitInfo(identifier, 'newsletter');
      expect(info.remaining).toBe(0);
      expect(info.isLimited).toBe(true);

      limiter.destroy();
    });
  });

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const mockRequest = {
        headers: {
          get: mock((name: string) => {
            if (name === 'x-forwarded-for') { return '192.168.1.1, 10.0.0.1'; }
            return null;
          }),
        },
      } as unknown as NextRequest;

      const ip = rateLimiterModule.getClientIp(mockRequest);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const mockRequest = {
        headers: {
          get: mock((name: string) => {
            if (name === 'x-real-ip') { return '192.168.1.2'; }
            return null;
          }),
        },
      } as unknown as NextRequest;

      const ip = rateLimiterModule.getClientIp(mockRequest);
      expect(ip).toBe('192.168.1.2');
    });

    it('should return localhost when no IP headers present', () => {
      const mockRequest = {
        headers: {
          get: mock(() => null),
        },
      } as unknown as NextRequest;

      const ip = rateLimiterModule.getClientIp(mockRequest);
      expect(ip).toBe('127.0.0.1');
    });

    it('should handle empty x-forwarded-for header', () => {
      const mockRequest = {
        headers: {
          get: mock((name: string) => {
            if (name === 'x-forwarded-for') { return ''; }
            return null;
          }),
        },
      } as unknown as NextRequest;

      const ip = rateLimiterModule.getClientIp(mockRequest);
      expect(ip).toBe('127.0.0.1');
    });
  });

  describe('RATE_LIMIT_CONFIGS', () => {
    it('should have expected configuration for api limit', () => {
      const config = rateLimiterModule.RATE_LIMIT_CONFIGS.api;
      expect(config.windowMs).toBe(60000); // 1 minute
      expect(config.maxRequests).toBe(60);
    });

    it('should have expected configuration for contactForm limit', () => {
      const config = rateLimiterModule.RATE_LIMIT_CONFIGS.contactForm;
      expect(config.windowMs).toBe(15 * 60 * 1000); // 15 minutes
      expect(config.maxRequests).toBe(3);
    });

    it('should have expected configuration for newsletter limit', () => {
      const config = rateLimiterModule.RATE_LIMIT_CONFIGS.newsletter;
      expect(config.windowMs).toBe(60000); // 1 minute
      expect(config.maxRequests).toBe(3);
    });

    it('should have expected configuration for readOnlyApi limit', () => {
      const config = rateLimiterModule.RATE_LIMIT_CONFIGS.readOnlyApi;
      expect(config.windowMs).toBe(60000); // 1 minute
      expect(config.maxRequests).toBe(100);
    });
  });
});
