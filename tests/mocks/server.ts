import { setupServer } from 'msw/node'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { handlers } from './handlers'

/**
 * MSW Server for Node.js (Unit Tests)
 * Intercepts API calls during test execution
 */

export const server = setupServer(...handlers)

// Start server before all tests
export function setupMockServer() {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())
}
