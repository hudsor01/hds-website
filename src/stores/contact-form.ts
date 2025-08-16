import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Simplified contact form state for future use
// Currently only used for tracking submission state if needed
interface ContactFormState {
  isSubmitted: boolean;
  submissionTimestamp: number | null;
  
  // Actions
  setSubmitted: (isSubmitted: boolean) => void;
  reset: () => void;
}

// Only use devtools in development
const withDevtools = process.env.NODE_ENV === 'development' 
  ? devtools 
  : ((fn: unknown) => fn) as typeof devtools;

export const useContactFormState = create<ContactFormState>()(
  withDevtools(
    (set) => ({
      isSubmitted: false,
      submissionTimestamp: null,
      
      setSubmitted: (isSubmitted: boolean) => 
        set({ 
          isSubmitted, 
          submissionTimestamp: isSubmitted ? Date.now() : null 
        }),
      
      reset: () => 
        set({ 
          isSubmitted: false, 
          submissionTimestamp: null 
        }),
    }),
    { name: 'contact-form-state' }
  )
);

// Note: This is a simplified version. The original complex form store
// with lead scoring and persistence has been removed to reduce complexity.
// If advanced features are needed later, they can be re-implemented.