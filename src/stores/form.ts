import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ContactFormData, LeadScoring } from '@/schemas/contact';

interface FormState<T = Record<string, unknown>> {
  data: Partial<T>;
  errors: Record<string, string[]>;
  isSubmitting: boolean;
  isValid: boolean;
  touchedFields: Set<string>;
  
  // Actions
  setField: <K extends keyof T>(field: K, value: T[K]) => void;
  setErrors: (errors: Record<string, string[]>) => void;
  setFieldError: (field: string, errors: string[]) => void;
  clearFieldError: (field: string) => void;
  touchField: (field: string) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
  setData: (data: Partial<T>) => void;
}

// Generic form store factory
export const createFormStore = <T extends Record<string, unknown>>(
  name: string,
  initialData: Partial<T> = {}
) => {
  return create<FormState<T>>()(
    devtools(
      persist(
        (set) => ({
          data: initialData,
          errors: {},
          isSubmitting: false,
          isValid: true,
          touchedFields: new Set<string>(),

          setField: (field, value) =>
            set((state) => ({
              data: { ...state.data, [field]: value },
              touchedFields: new Set([...state.touchedFields, String(field)]),
            })),

          setErrors: (errors) =>
            set({ errors, isValid: Object.keys(errors).length === 0 }),

          setFieldError: (field, errors) =>
            set((state) => ({
              errors: { ...state.errors, [field]: errors },
              isValid: false,
            })),

          clearFieldError: (field) =>
            set((state) => {
              const newErrors = { ...state.errors };
              delete newErrors[field];
              return {
                errors: newErrors,
                isValid: Object.keys(newErrors).length === 0,
              };
            }),

          touchField: (field) =>
            set((state) => ({
              touchedFields: new Set([...state.touchedFields, field]),
            })),

          setSubmitting: (isSubmitting) => set({ isSubmitting }),

          reset: () =>
            set({
              data: initialData,
              errors: {},
              isSubmitting: false,
              isValid: true,
              touchedFields: new Set(),
            }),

          setData: (data) => set({ data }),
        }),
        {
          name: `${name}-form-storage`,
          partialize: (state) => ({ data: state.data }), // Only persist form data
        }
      ),
      { name: `${name}-form` }
    )
  );
};

// Contact form specific store
interface ContactFormStore extends FormState<ContactFormData> {
  leadScoring: LeadScoring | null;
  submissionResult: {
    success: boolean;
    message: string;
    timestamp: number;
  } | null;
  isSubmitted: boolean;
  
  // Additional actions
  setLeadScoring: (scoring: LeadScoring) => void;
  setSubmissionResult: (result: ContactFormStore['submissionResult']) => void;
  getFormProgress: () => number;
  setSubmitted: (isSubmitted: boolean) => void;
  updateData: (data: Partial<ContactFormData>) => void;
  resetForm: () => void;
}

export const useContactFormStore = create<ContactFormStore>()(
  devtools(
    persist(
      (set, get) => ({
        data: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          message: '',
          service: undefined,
          budget: undefined,
          timeline: undefined,
        },
        errors: {},
        isSubmitting: false,
        isValid: true,
        touchedFields: new Set<string>(),
        leadScoring: null,
        submissionResult: null,
        isSubmitted: false,

        setField: (field, value) =>
          set((state) => ({
            data: { ...state.data, [field]: value },
            touchedFields: new Set([...state.touchedFields, String(field)]),
          })),

        setErrors: (errors) =>
          set({ errors, isValid: Object.keys(errors).length === 0 }),

        setFieldError: (field, errors) =>
          set((state) => ({
            errors: { ...state.errors, [field]: errors },
            isValid: false,
          })),

        clearFieldError: (field) =>
          set((state) => {
            const newErrors = { ...state.errors };
            delete newErrors[field];
            return {
              errors: newErrors,
              isValid: Object.keys(newErrors).length === 0,
            };
          }),

        touchField: (field) =>
          set((state) => ({
            touchedFields: new Set([...state.touchedFields, field]),
          })),

        setSubmitting: (isSubmitting) => set({ isSubmitting }),

        reset: () =>
          set({
            data: {
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              company: '',
              message: '',
              service: undefined,
              budget: undefined,
              timeline: undefined,
            },
            errors: {},
            isSubmitting: false,
            isValid: true,
            touchedFields: new Set(),
            leadScoring: null,
            submissionResult: null,
            isSubmitted: false,
          }),

        setData: (data) => set({ data }),

        setLeadScoring: (scoring) => set({ leadScoring: scoring }),

        setSubmissionResult: (result) => set({ submissionResult: result }),

        getFormProgress: () => {
          const state = get();
          const requiredFields = ['firstName', 'lastName', 'email', 'message'];
          const filledRequired = requiredFields.filter(
            (field) => state.data[field as keyof ContactFormData]
          ).length;
          const totalFields = Object.keys(state.data).length;
          const filledTotal = Object.values(state.data).filter(Boolean).length;
          
          // Weight required fields more heavily
          return Math.round(
            ((filledRequired / requiredFields.length) * 70 +
              (filledTotal / totalFields) * 30)
          );
        },

        setSubmitted: (isSubmitted) => set({ isSubmitted }),

        updateData: (data) => set((state) => ({ data: { ...state.data, ...data } })),

        resetForm: () => set({
          data: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            company: '',
            message: '',
            service: undefined,
            budget: undefined,
            timeline: undefined,
          },
          errors: {},
          isSubmitting: false,
          isValid: true,
          touchedFields: new Set(),
          leadScoring: null,
          submissionResult: null,
          isSubmitted: false,
        }),
      }),
      {
        name: 'contact-form-storage',
        partialize: (state) => ({ 
          data: state.data,
          submissionResult: state.submissionResult,
          isSubmitted: state.isSubmitted,
        }),
      }
    ),
    { name: 'contact-form' }
  )
);