import type { PostHogPropertyValue } from "./test";

declare global {
  interface Window {
    posthog?: {
      captureException: (
        error: Error,
        properties?: Record<string, PostHogPropertyValue>
      ) => void;
      capture: (
        event: string,
        properties?: Record<string, PostHogPropertyValue>
      ) => void;
    };
    saveFormData?: (data: unknown) => void;
    loadFormData?: () => unknown;
    clearFormData?: () => void;
  }
}

export {};

export {};
