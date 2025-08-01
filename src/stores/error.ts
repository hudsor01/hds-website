import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Only use devtools in development
const withDevtools = process.env.NODE_ENV === 'development' 
  ? devtools 
  : ((fn: unknown) => fn) as typeof devtools;

export interface ErrorRecord {
  id: string;
  message: string;
  code?: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  url?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'validation' | 'runtime' | 'permission' | 'unknown';
  metadata?: Record<string, unknown>;
  resolved: boolean;
}

interface ErrorStore {
  errors: ErrorRecord[];
  activeError: ErrorRecord | null;
  errorCount: number;
  
  // Actions
  addError: (error: Omit<ErrorRecord, 'id' | 'timestamp' | 'resolved'>) => void;
  resolveError: (id: string) => void;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
  setActiveError: (error: ErrorRecord | null) => void;
  getErrorsByCategory: (category: ErrorRecord['category']) => ErrorRecord[];
  getUnresolvedErrors: () => ErrorRecord[];
  getRecentErrors: (limit?: number) => ErrorRecord[];
}

export const useErrorStore = create<ErrorStore>()(
  withDevtools(
    persist(
      (set, get) => ({
        errors: [],
        activeError: null,
        errorCount: 0,

        addError: (error) => {
          const newError: ErrorRecord = {
            ...error,
            id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            resolved: false,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          };

          set((state) => ({
            errors: [newError, ...state.errors].slice(0, 100), // Keep last 100 errors
            errorCount: state.errorCount + 1,
            activeError: newError,
          }));

          // Log to analytics if critical
          if (newError.severity === 'critical') {
            console.error('Critical error:', newError);
            // Could integrate with PostHog or other analytics here
          }
        },

        resolveError: (id) =>
          set((state) => ({
            errors: state.errors.map((error) =>
              error.id === id ? { ...error, resolved: true } : error
            ),
            activeError:
              state.activeError?.id === id
                ? { ...state.activeError, resolved: true }
                : state.activeError,
          })),

        clearError: (id) =>
          set((state) => ({
            errors: state.errors.filter((error) => error.id !== id),
            activeError: state.activeError?.id === id ? null : state.activeError,
          })),

        clearAllErrors: () =>
          set({
            errors: [],
            activeError: null,
          }),

        setActiveError: (error) => set({ activeError: error }),

        getErrorsByCategory: (category) => {
          return get().errors.filter((error) => error.category === category);
        },

        getUnresolvedErrors: () => {
          return get().errors.filter((error) => !error.resolved);
        },

        getRecentErrors: (limit = 10) => {
          return get().errors.slice(0, limit);
        },
      }),
      {
        name: 'error-storage',
        partialize: (state) => ({
          errors: state.errors.slice(0, 50).map(error => ({
            ...error,
            // Remove potentially sensitive data from persisted errors
            stack: undefined,
            componentStack: undefined,
            metadata: error.metadata ? {
              ...error.metadata,
              // Filter out sensitive metadata fields
              password: undefined,
              token: undefined,
              apiKey: undefined,
              secret: undefined,
            } : undefined,
          })),
          errorCount: state.errorCount,
        }),
      }
    ),
    { name: 'error-store' }
  )
);

// Helper function to create error from unknown values
export function createErrorRecord(
  error: unknown,
  category: ErrorRecord['category'] = 'unknown',
  severity: ErrorRecord['severity'] = 'medium'
): Omit<ErrorRecord, 'id' | 'timestamp' | 'resolved'> {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      code: (error as { code?: string }).code,
      category,
      severity,
      metadata: {
        name: error.name,
        cause: (error as { cause?: unknown }).cause,
      },
    };
  }

  if (typeof error === 'string') {
    return {
      message: error,
      category,
      severity,
    };
  }

  return {
    message: 'An unknown error occurred',
    category,
    severity,
    metadata: { originalError: error },
  };
}