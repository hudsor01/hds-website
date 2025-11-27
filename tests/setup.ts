// Vitest setup file
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock logger to prevent errors in tests
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  setContext: vi.fn(),
};

vi.mock('@/lib/logger', () => ({
  logger: mockLogger,
  createServerLogger: vi.fn(() => mockLogger),
}));

beforeAll(() => {
  // Setup before all tests
});

afterEach(() => {
  // Cleanup after each test
});

afterAll(() => {
  // Cleanup after all tests
});
