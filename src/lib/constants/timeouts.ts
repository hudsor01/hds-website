/**
 * Standard timeout durations for UI feedback
 * All values in milliseconds
 */
export const TIMEOUTS = {
  /** Duration for "Copied!" feedback toast (2 seconds) */
  COPY_FEEDBACK: 2000,

  /** Duration for save success message (3 seconds) */
  SAVE_SUCCESS: 3000,

  /** Delay before triggering print dialog (100ms) */
  PRINT_DELAY: 100,

  /** Duration for generic toast messages (4 seconds) */
  TOAST_DEFAULT: 4000,

  /** Duration for error messages (6 seconds) */
  TOAST_ERROR: 6000,
} as const;

export type TimeoutKey = keyof typeof TIMEOUTS;
