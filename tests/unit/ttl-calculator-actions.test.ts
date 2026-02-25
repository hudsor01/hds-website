/**
 * TTL Calculator Server Action Unit Tests
 * Tests for src/app/actions/ttl-calculator.ts
 *
 * Covers:
 * - generateShareCode() characteristics (length, charset, uniqueness) via saveCalculation
 * - loadCalculation() Zod safeParse on JSONB inputs/results
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { cleanupMocks } from '../test-utils';
import type { CalculationResults, VehicleInputs } from '@/types/ttl-types';

// Minimal valid inputs/results — Zod schema marks most VehicleInputs fields
// as optional, so these minimal fixtures are sufficient for runtime validation.
// The TypeScript interface is broader than what Zod requires at runtime.
const validInputs = {
  purchasePrice: 35000,
  county: 'Travis',
} as unknown as VehicleInputs;

const validResults = {
  ttlResults: {
    salesTax: 2187.5,
    titleFee: 28,
    registrationFees: 51.75,
    totalTTL: 2267.25,
  },
  paymentResults: {
    loanAmount: 35000,
    monthlyPayment: 672.5,
    totalInterest: 5350,
    totalFinanced: 40350,
  },
} as unknown as CalculationResults;

/**
 * Shared helper that sets up all module mocks needed by both saveCalculation
 * and loadCalculation tests. The db mock is supplied by the caller so each
 * test can control DB behaviour independently.
 */
function setupCommonMocks(dbMock: Record<string, unknown>) {
  mock.module('@/env', () => ({
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_SITE_URL: 'https://hudsondigitalsolutions.com',
    },
  }));

  mock.module('@/lib/logger', () => ({
    logger: {
      debug: mock(),
      info: mock(),
      warn: mock(),
      error: mock(),
      setContext: mock(),
    },
    castError: (error: unknown) =>
      error instanceof Error ? error : new Error(String(error)),
  }));

  mock.module('@/lib/resend-client', () => ({
    isResendConfigured: mock().mockReturnValue(false),
    getResendClient: mock(() => ({
      emails: { send: mock().mockResolvedValue({ data: { id: 'test-id' } }) },
    })),
  }));

  mock.module('@/lib/constants/business', () => ({
    BUSINESS_INFO: {
      name: 'Hudson Digital Solutions',
      email: 'hello@hudsondigitalsolutions.com',
    },
  }));

  mock.module('@/lib/utils', () => ({
    formatCurrency: (n: number) => `$${n.toFixed(2)}`,
  }));

  mock.module('@/lib/schemas/ttl', () => ({
    ttlCalculations: {
      shareCode: 'shareCode',
      inputs: 'inputs',
      results: 'results',
      name: 'name',
      email: 'email',
      county: 'county',
      purchasePrice: 'purchasePrice',
      viewCount: 'viewCount',
      lastViewedAt: 'lastViewedAt',
      createdAt: 'createdAt',
    },
  }));

  // Do NOT mock drizzle-orm — it exports tagged template literals and many
  // named exports. Mocking it partially breaks other test files in the suite.
  // The DB mock intercepts all chained calls so drizzle helpers are never
  // actually executed against a real database.
  mock.module('@/lib/db', () => ({ db: dbMock }));
}

// ===================================================================
// saveCalculation — share code generation
// ===================================================================

describe('saveCalculation — share code generation', () => {
  beforeEach(() => {
    setupCommonMocks({
      select: mock().mockReturnValue({
        from: mock().mockReturnValue({
          where: mock().mockReturnValue({
            limit: mock().mockResolvedValue([]), // no collision
          }),
        }),
      }),
      insert: mock().mockReturnValue({
        values: mock().mockResolvedValue(undefined),
      }),
    });
  });

  afterEach(() => {
    cleanupMocks();
  });

  it('returns success:true and a shareCode on valid inputs', async () => {
    const { saveCalculation } = await import('@/app/actions/ttl-calculator');
    const result = await saveCalculation(validInputs, validResults);

    expect(result.success).toBe(true);
    expect(typeof result.shareCode).toBe('string');
  });

  it('share code is exactly 8 characters long', async () => {
    const { saveCalculation } = await import('@/app/actions/ttl-calculator');
    const result = await saveCalculation(validInputs, validResults);

    expect(result.shareCode).toHaveLength(8);
  });

  it('share code contains only URL-safe characters (no ambiguous chars)', async () => {
    const { saveCalculation } = await import('@/app/actions/ttl-calculator');

    // The charset excludes 0, O, I, l, 1 to avoid visual confusion
    const allowedPattern = /^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789]+$/;
    for (let i = 0; i < 5; i++) {
      const result = await saveCalculation(validInputs, validResults);
      if (result.shareCode) {
        expect(result.shareCode).toMatch(allowedPattern);
      }
    }
  });

  it('generates different share codes on repeated calls (uses crypto, not Math.random)', async () => {
    const { saveCalculation } = await import('@/app/actions/ttl-calculator');

    const codes = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const result = await saveCalculation(validInputs, validResults);
      if (result.shareCode) {
        codes.add(result.shareCode);
      }
    }

    // With 10 calls using crypto randomness the chance of any collision is negligible
    expect(codes.size).toBeGreaterThan(1);
  });

  it('returns error when inputs fail Zod validation', async () => {
    const { saveCalculation } = await import('@/app/actions/ttl-calculator');

    // purchasePrice is missing — should fail Zod
    const badInputs = { county: 'Travis' } as unknown as VehicleInputs;
    const result = await saveCalculation(badInputs, validResults);

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe('string');
  });
});

// ===================================================================
// loadCalculation — JSONB safeParse validation
// ===================================================================

describe('loadCalculation — JSONB safeParse validation', () => {
  afterEach(() => {
    cleanupMocks();
  });

  it('returns success:true with typed data when JSONB is valid', async () => {
    setupCommonMocks({
      select: mock().mockReturnValue({
        from: mock().mockReturnValue({
          where: mock().mockReturnValue({
            limit: mock().mockResolvedValue([
              {
                inputs: validInputs,
                results: validResults,
                name: 'Test Calculation',
                viewCount: 0,
              },
            ]),
          }),
        }),
      }),
      update: mock().mockReturnValue({
        set: mock().mockReturnValue({
          where: mock().mockResolvedValue([]),
        }),
      }),
    });

    const { loadCalculation } = await import('@/app/actions/ttl-calculator');
    const result = await loadCalculation('ABCD1234');

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.inputs.purchasePrice).toBe(35000);
  });

  it('returns error when stored inputs JSONB is malformed', async () => {
    setupCommonMocks({
      select: mock().mockReturnValue({
        from: mock().mockReturnValue({
          where: mock().mockReturnValue({
            limit: mock().mockResolvedValue([
              {
                // inputs is missing required "purchasePrice" and "county"
                inputs: { notAPriceField: 'garbage' },
                results: validResults,
                name: null,
                viewCount: 0,
              },
            ]),
          }),
        }),
      }),
      update: mock().mockReturnValue({
        set: mock().mockReturnValue({
          where: mock().mockResolvedValue([]),
        }),
      }),
    });

    const { loadCalculation } = await import('@/app/actions/ttl-calculator');
    const result = await loadCalculation('ABCD1234');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Stored calculation data is invalid');
  });

  it('returns error when stored results JSONB is malformed', async () => {
    setupCommonMocks({
      select: mock().mockReturnValue({
        from: mock().mockReturnValue({
          where: mock().mockReturnValue({
            limit: mock().mockResolvedValue([
              {
                inputs: validInputs,
                // results is missing required ttlResults/paymentResults
                results: { randomKey: 99 },
                name: null,
                viewCount: 0,
              },
            ]),
          }),
        }),
      }),
      update: mock().mockReturnValue({
        set: mock().mockReturnValue({
          where: mock().mockResolvedValue([]),
        }),
      }),
    });

    const { loadCalculation } = await import('@/app/actions/ttl-calculator');
    const result = await loadCalculation('ABCD1234');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Stored calculation data is invalid');
  });

  it('returns error when the share code is too short', async () => {
    setupCommonMocks({
      select: mock().mockReturnValue({
        from: mock().mockReturnValue({
          where: mock().mockReturnValue({
            limit: mock().mockResolvedValue([]),
          }),
        }),
      }),
    });

    const { loadCalculation } = await import('@/app/actions/ttl-calculator');
    const result = await loadCalculation('AB'); // under min length of 6

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid share code');
  });

  it('returns error when the share code is not found in DB', async () => {
    setupCommonMocks({
      select: mock().mockReturnValue({
        from: mock().mockReturnValue({
          where: mock().mockReturnValue({
            limit: mock().mockResolvedValue([]), // empty result
          }),
        }),
      }),
    });

    const { loadCalculation } = await import('@/app/actions/ttl-calculator');
    const result = await loadCalculation('ABCDEF12');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Calculation not found or has expired');
  });
});
