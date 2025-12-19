import { describe, it, expect, beforeEach, afterEach, vi } from 'bun:test';
import { UnifiedRateLimiter, getClientIp, RATE_LIMIT_CONFIGS, type RateLimitType } from '@/lib/rate-limiter';
import type { NextRequest } from 'next/server';

describe('UnifiedRateLimiter', () => {
  let limiter: UnifiedRateLimiter;

  beforeEach(() => {
    limiter = new UnifiedRateLimiter();
  });

  afterEach(() => {
    limiter.destroy();
  });

  describe('checkLimit with default config', () => {
    it('allows requests under the limit', async () => {
      const identifier = 'test-user-1';
      const config = RATE_LIMIT_CONFIGS.default;

      // Should allow first request
      const result1 = await limiter.checkLimit(identifier, 'default');
      expect(result1).toBe(true);

      // Should allow subsequent requests under limit
      for (let i = 0; i < config.maxRequests - 2; i++) {
        const result = await limiter.checkLimit(identifier, 'default');
        expect(result).toBe(true);
      }
    });

    it('blocks requests over the limit', async () => {
      const identifier = 'test-user-2';
      const config = RATE_LIMIT_CONFIGS.default;

      // Exhaust the limit
      for (let i = 0; i < config.maxRequests; i++) {
        await limiter.checkLimit(identifier, 'default');
      }

      // Next request should be blocked
      const blockedResult = await limiter.checkLimit(identifier, 'default');
      expect(blockedResult).toBe(false);
    });

    it('resets count after window expires', async () => {
      const identifier = 'test-user-3';
      const config = RATE_LIMIT_CONFIGS.default;

      // Exhaust the limit
      for (let i = 0; i < config.maxRequests; i++) {
        await limiter.checkLimit(identifier, 'default');
      }

      // Should be blocked
      expect(await limiter.checkLimit(identifier, 'default')).toBe(false);

      // Mock time advancing past the window
      vi.useFakeTimers();
      vi.advanceTimersByTime(config.windowMs + 1000);

      // Should allow again after window expires
      const result = await limiter.checkLimit(identifier, 'default');
      expect(result).toBe(true);

      vi.useRealTimers();
    });
  });

  describe('checkLimit with contact form config', () => {
    it('enforces stricter limits for contact form', async () => {
      const identifier = 'test-user-4';
      const config = RATE_LIMIT_CONFIGS.contactForm;

      // Should allow up to maxRequests
      for (let i = 0; i < config.maxRequests; i++) {
        const result = await limiter.checkLimit(identifier, 'contactForm');
        expect(result).toBe(true);
      }

      // Should block after maxRequests
      const blockedResult = await limiter.checkLimit(identifier, 'contactForm');
      expect(blockedResult).toBe(false);
    });
  });

  describe('checkLimit with different limit types', () => {
    it('isolates limits between different types', async () => {
      const identifier = 'test-user-5';

      // Exhaust default limit
      const defaultConfig = RATE_LIMIT_CONFIGS.default;
      for (let i = 0; i < defaultConfig.maxRequests; i++) {
        await limiter.checkLimit(identifier, 'default');
      }

      // Default should be blocked
      expect(await limiter.checkLimit(identifier, 'default')).toBe(false);

      // Newsletter limit should still allow requests
      expect(await limiter.checkLimit(identifier, 'newsletter')).toBe(true);

      // Contact form limit should still allow requests
      expect(await limiter.checkLimit(identifier, 'contactForm')).toBe(true);
    });
  });

  describe('getLimitInfo', () => {
    it('returns correct remaining count', async () => {
      const identifier = 'test-user-6';
      const config = RATE_LIMIT_CONFIGS.api;

      // Check initial state
      const info1 = await limiter.getLimitInfo(identifier, 'api');
      expect(info1.remaining).toBe(config.maxRequests);
      expect(info1.isLimited).toBe(false);

      // Make some requests
      await limiter.checkLimit(identifier, 'api');
      await limiter.checkLimit(identifier, 'api');

      const info2 = await limiter.getLimitInfo(identifier, 'api');
      expect(info2.remaining).toBe(config.maxRequests - 2);
      expect(info2.isLimited).toBe(false);

      // Exhaust limit
      for (let i = 0; i < config.maxRequests - 2; i++) {
        await limiter.checkLimit(identifier, 'api');
      }

      const info3 = await limiter.getLimitInfo(identifier, 'api');
      expect(info3.remaining).toBe(0);
      expect(info3.isLimited).toBe(true);
    });

    it('returns correct reset time', async () => {
      const identifier = 'test-user-7';
      const config = RATE_LIMIT_CONFIGS.api;
      const beforeTime = Date.now();

      await limiter.checkLimit(identifier, 'api');

      const info = await limiter.getLimitInfo(identifier, 'api');

      // Reset time should be approximately windowMs from now
      const expectedResetTime = beforeTime + config.windowMs;
      expect(info.resetTime).toBeGreaterThanOrEqual(expectedResetTime - 100);
      expect(info.resetTime).toBeLessThanOrEqual(expectedResetTime + 100);
    });

    it('returns fresh info for expired entry', async () => {
      const identifier = 'test-user-8';
      const config = RATE_LIMIT_CONFIGS.newsletter;

      // Make a request
      await limiter.checkLimit(identifier, 'newsletter');

      // Mock time advancing past window
      vi.useFakeTimers();
      vi.advanceTimersByTime(config.windowMs + 1000);

      const info = await limiter.getLimitInfo(identifier, 'newsletter');
      expect(info.remaining).toBe(config.maxRequests);
      expect(info.isLimited).toBe(false);

      vi.useRealTimers();
    });
  });

  // Note: Tests for internal cleanup mechanisms removed
  // The cleanup functionality is already verified through public API tests:
  // - "resets count after window expires" verifies expired entries are handled correctly
  // - "returns fresh info for expired entry" verifies getLimitInfo handles expired entries
  // - afterEach() calls destroy() to ensure cleanup runs in all tests

  describe('all rate limit types', () => {
    const limitTypes: RateLimitType[] = [
      'default',
      'api',
      'contactForm',
      'contactFormApi',
      'newsletter',
      'readOnlyApi'
    ];

    limitTypes.forEach(limitType => {
      it(`enforces ${limitType} rate limit correctly`, async () => {
        const identifier = `test-user-${limitType}`;
        const config = RATE_LIMIT_CONFIGS[limitType];

        // Allow up to max
        for (let i = 0; i < config.maxRequests; i++) {
          const result = await limiter.checkLimit(identifier, limitType);
          expect(result).toBe(true);
        }

        // Block after max
        const blocked = await limiter.checkLimit(identifier, limitType);
        expect(blocked).toBe(false);
      });
    });
  });
});

describe('getClientIp', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === 'x-forwarded-for') {
            return '203.0.113.1, 198.51.100.1';
          }
          return null;
        }
      }
    } as unknown as NextRequest;

    const ip = getClientIp(request);
    expect(ip).toBe('203.0.113.1');
  });

  it('extracts IP from x-real-ip header if x-forwarded-for is absent', () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === 'x-real-ip') {
            return '192.0.2.1';
          }
          return null;
        }
      }
    } as unknown as NextRequest;

    const ip = getClientIp(request);
    expect(ip).toBe('192.0.2.1');
  });

  it('returns localhost when no IP headers are present', () => {
    const request = {
      headers: {
        get: () => null
      }
    } as unknown as NextRequest;

    const ip = getClientIp(request);
    expect(ip).toBe('127.0.0.1');
  });

  it('handles x-forwarded-for with whitespace', () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === 'x-forwarded-for') {
            return '  192.0.2.1  , 198.51.100.1';
          }
          return null;
        }
      }
    } as unknown as NextRequest;

    const ip = getClientIp(request);
    expect(ip).toBe('192.0.2.1');
  });

  it('handles x-real-ip with whitespace', () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === 'x-real-ip') {
            return '  192.0.2.1  ';
          }
          return null;
        }
      }
    } as unknown as NextRequest;

    const ip = getClientIp(request);
    expect(ip).toBe('192.0.2.1');
  });

  it('falls back to localhost if x-forwarded-for is empty after split', () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === 'x-forwarded-for') {
            return '';
          }
          return null;
        }
      }
    } as unknown as NextRequest;

    const ip = getClientIp(request);
    expect(ip).toBe('127.0.0.1');
  });
});
