/**
 * Test logger utility for structured test output
 */

import { logger } from '../src/lib/logger';

export interface TestLogger {
  step: (message: string) => void;
  analysis: (component: string, property: string, value?: unknown) => void;
  verify: (description: string, value: unknown, expected?: unknown) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string, error?: unknown) => void;
  success: (message: string) => void;
  screenshot: (path: string, description?: string) => void;
  complete: (message: string) => void;
}

export function createTestLogger(testName: string): TestLogger {
  const prefix = `[${testName}]`;

  return {
    step: (message: string) => {
      logger.info(`${prefix} STEP: ${message}`);
    },
    analysis: (component: string, property: string, value?: unknown) => {
      logger.info(`${prefix} ANALYSIS: ${component} - ${property}:`, { value });
    },
    verify: (description: string, value: unknown, expected?: unknown) => {
      logger.info(`${prefix} VERIFY: ${description}:`, { value, expected: expected !== undefined ? expected : undefined });
    },
    info: (message: string) => {
      logger.info(`${prefix} INFO: ${message}`);
    },
    warn: (message: string) => {
      logger.warn(`${prefix} WARN: ${message}`);
    },
    error: (message: string, error?: unknown) => {
      logger.error(`${prefix} ERROR: ${message}`, error);
    },
    success: (message: string) => {
      logger.info(`${prefix} SUCCESS: ${message}`);
    },
    screenshot: (path: string, description?: string) => {
      logger.info(`${prefix} SCREENSHOT: ${path}${description ? ` - ${description}` : ''}`);
    },
    complete: (message: string) => {
      logger.info(`${prefix} COMPLETE: ${message}`);
    },
  };
}
