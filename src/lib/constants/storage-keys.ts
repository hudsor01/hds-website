/**
 * Storage keys for localStorage and sessionStorage
 * Prevents typos and makes tracking easier
 */
export const STORAGE_KEYS = {
  /** TTL calculator saved calculations */
  TTL_SAVED_CALCULATIONS: 'savedCalculations',

  /** User theme preference */
  THEME: 'theme',

  /** Tool usage analytics */
  TOOL_USAGE: 'toolUsage',

  /** Form draft data */
  FORM_DRAFTS: 'formDrafts',

  /** Authentication token */
  AUTH_TOKEN: 'auth-token',

  /** Analytics session identifier */
  SESSION_ID: 'session_id',
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;
