import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  service: string
  budget: string
  timeline: string
  message: string
}

interface FormErrors {
  [key: string]: string | undefined
}

interface ContactStore {
  form: FormData
  errors: FormErrors
  isSubmitted: boolean
  isPending: boolean
  
  // Actions
  setForm: (form: Partial<FormData>) => void
  setErrors: (errors: FormErrors) => void
  setIsSubmitted: (isSubmitted: boolean) => void
  setIsPending: (isPending: boolean) => void
  resetForm: () => void
  clearError: (field: string) => void
  validateForm: () => FormErrors
}

const initialFormState: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  service: '',
  budget: '',
  timeline: '',
  message: '',
}

export const useContactStore = create<ContactStore>()(
  devtools(
    (set, get) => ({
      form: initialFormState,
      errors: {},
      isSubmitted: false,
      isPending: false,
      
      setForm: (newForm) => {
        set((state) => ({
          form: { ...state.form, ...newForm }
        }))
      },
      
      setErrors: (errors) => set({ errors }),
      
      setIsSubmitted: (isSubmitted) => set({ isSubmitted }),
      
      setIsPending: (isPending) => set({ isPending }),
      
      resetForm: () => set({ 
        form: initialFormState, 
        errors: {}, 
        isSubmitted: false, 
        isPending: false 
      }),
      
      clearError: (field) => {
        set((state) => {
          const newErrors = { ...state.errors }
          delete newErrors[field]
          return { errors: newErrors }
        })
      },
      
      validateForm: () => {
        const { form } = get()
        const newErrors: FormErrors = {}

        if (!form.firstName.trim()) newErrors.firstName = 'First name is required'
        if (!form.lastName.trim()) newErrors.lastName = 'Last name is required'
        if (!form.email.trim()) {
          newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
          newErrors.email = 'Email is invalid'
        }
        if (form.phone && !/^[\d\s\-\+\(\)]+$/.test(form.phone)) {
          newErrors.phone = 'Phone number is invalid'
        }
        if (!form.message.trim()) {
          newErrors.message = 'Message is required'
        } else if (form.message.trim().length < 10) {
          newErrors.message = 'Message must be at least 10 characters'
        }

        return newErrors
      }
    }),
    {
      name: 'contact-store',
    }
  )
)