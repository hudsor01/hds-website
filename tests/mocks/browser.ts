import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/**
 * MSW Worker for Browser (E2E Tests)
 * Intercepts API calls during Playwright/browser testing
 */

export const worker = setupWorker(...handlers)
