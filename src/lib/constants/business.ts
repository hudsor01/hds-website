/**
 * Hudson Digital Solutions business information
 * Single source of truth for company contact details
 */
export const BUSINESS_INFO = {
  /** Company legal name */
  name: 'Hudson Digital Solutions',

  /** Short display name */
  displayName: 'Hudson Digital',

  /** Primary contact email */
  email: 'hello@hudsondigitalsolutions.com',

  /** Business location */
  location: {
    city: 'Dallas',
    state: 'Texas',
    stateCode: 'TX',
    country: 'United States',
  },

  /** Social media and web presence */
  links: {
    website: 'https://hudsondigitalsolutions.com',
  },
} as const;

export type BusinessInfo = typeof BUSINESS_INFO;
