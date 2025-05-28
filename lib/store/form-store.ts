import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Form State for Contact and other forms
interface FormState {
  isSubmitting: boolean
  submitStatus: 'idle' | 'loading' | 'success' | 'error'
  submitMessage: string | null
  setSubmitting: (_isSubmitting: boolean) => void
  setSubmitStatus: (
    _status: 'idle' | 'loading' | 'success' | 'error',
    _message?: string
  ) => void
  resetForm: () => void
}

export const useFormStore = create<FormState>()(
  devtools(
    set => ({
      isSubmitting: false,
      submitStatus: 'idle',
      submitMessage: null,
      setSubmitting: isSubmitting => set({ isSubmitting }),
      setSubmitStatus: (status, message = undefined) =>
        set({ submitStatus: status, submitMessage: message ?? null }),
      resetForm: () =>
        set({ isSubmitting: false, submitStatus: 'idle', submitMessage: null }),
    }),
    {
      name: 'form-store',
    },
  ),
)
