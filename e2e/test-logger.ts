/**
 * Test logger utility for structured test output
 */

export interface TestLogger {
  step: (message: string) => void;
  analysis: (component: string, property: string, value?: unknown) => void;
  verify: (description: string, value: unknown, expected?: unknown) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string, error?: unknown) => void;
  screenshot: (path: string, description?: string) => void;
  complete: (message: string) => void;
}

export function createTestLogger(testName: string): TestLogger {
  const prefix = `[${testName}]`;

  return {
    step: (message: string) => {
      console.log(`${prefix} STEP: ${message}`);
    },
    analysis: (component: string, property: string, value?: unknown) => {
      console.log(`${prefix} ANALYSIS: ${component} - ${property}:`, value);
    },
    verify: (description: string, value: unknown, expected?: unknown) => {
      console.log(`${prefix} VERIFY: ${description}:`, value, expected !== undefined ? `(expected: ${expected})` : '');
    },
    info: (message: string) => {
      console.log(`${prefix} INFO: ${message}`);
    },
    warn: (message: string) => {
      console.warn(`${prefix} WARN: ${message}`);
    },
    error: (message: string, error?: unknown) => {
      console.error(`${prefix} ERROR: ${message}`, error);
    },
    screenshot: (path: string, description?: string) => {
      console.log(`${prefix} SCREENSHOT: ${path}${description ? ` - ${description}` : ''}`);
    },
    complete: (message: string) => {
      console.log(`${prefix} COMPLETE: ${message}`);
    },
  };
}
