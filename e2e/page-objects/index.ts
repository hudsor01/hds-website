/**
 * Page Object Model exports for easy importing
 * 
 * Usage:
 * import { HomePage, ContactPage, ServicesPage, PortfolioPage } from './page-objects';
 * 
 * Or specific imports:
 * import { ContactPage } from './page-objects/ContactPage';
 */

export { BasePage } from './BasePage';
export { HomePage } from './HomePage';
export { ContactPage } from './ContactPage';
export { ServicesPage } from './ServicesPage';
export { PortfolioPage } from './PortfolioPage';

// Type exports
export type { ContactFormData } from './ContactPage';

// Re-export commonly used types from Playwright
export type { Page, Locator, expect } from '@playwright/test';