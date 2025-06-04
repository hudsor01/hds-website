import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Form State for Contact and other forms
interface FormState {
  isSubmitting: boolean
  submitStatus: 'idle' | 'loading' | 'success' | 'error'
  submitMessage: string | null
  setSubmitting: () => void
  setSubmitStatus: ( ) => void
  resetForm: () => void
}

export const useFormStore = create<FormState>()(
  devtools(
    set => ({
      isSubmitting: false,
      submitStatus: 'idle',
      submitMessage: null,
      setSubmitting: (isSubmitting: boolean) => set({ isSubmitting }),
      setSubmitStatus: (status: 'idle' | 'loading' | 'success' | 'error', message: string | null = null) =>
        set({ submitStatus: status, submitMessage: message ?? null }),
      resetForm: () =>
        set({ isSubmitting: false, submitStatus: 'idle', submitMessage: null }),
    }),
    {
      name: 'form-store',
    },
  ),
)
