'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

/**
 * Toast Notification System
 *
 * A lightweight, accessible toast notification system for user feedback.
 * Supports multiple toast types (success, error, info, warning) with automatic dismissal.
 *
 * @example
 * ```tsx
 * const { showToast } = useToast()
 *
 * showToast({
 *   type: 'success',
 *   title: 'Form Submitted',
 *   message: 'We will get back to you soon!'
 * })
 * ```
 */

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

/**
 * Toast Provider Component
 *
 * Wrap your app or specific sections with this provider to enable toast notifications.
 * Manages toast state and automatic dismissal.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const duration = toast.duration ?? 5000

    setToasts((prev) => [...prev, { ...toast, id }])

    // Auto dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id)
      }, duration)
    }
  }, [dismissToast])

  const toastStyles: Record<ToastType, { bg: string; border: string; icon: typeof CheckCircleIcon; iconColor: string }> = {
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      icon: CheckCircleIcon,
      iconColor: 'text-green-400'
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: XCircleIcon,
      iconColor: 'text-red-400'
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      icon: ExclamationCircleIcon,
      iconColor: 'text-yellow-400'
    },
    info: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      icon: InformationCircleIcon,
      iconColor: 'text-cyan-400'
    }
  }

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Toast Container */}
      <div
        className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-md w-full pointer-events-none"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast) => {
          const style = toastStyles[toast.type]
          const Icon = style.icon

          return (
            <div
              key={toast.id}
              role="alert"
              aria-live="polite"
              className={`
                ${style.bg} ${style.border}
                border backdrop-blur-sm rounded-lg p-4 shadow-xl
                animate-in slide-in-from-right duration-300
                pointer-events-auto
              `}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {toast.title}
                  </p>
                  {toast.message && (
                    <p className="text-sm text-gray-300 mt-1">
                      {toast.message}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => dismissToast(toast.id)}
                  className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                  aria-label="Dismiss notification"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

/**
 * useToast Hook
 *
 * Custom hook to access toast notification functions from any component.
 *
 * @throws {Error} If used outside of ToastProvider
 *
 * @example
 * ```tsx
 * const { showToast } = useToast()
 *
 * const handleSubmit = () => {
 *   showToast({
 *     type: 'success',
 *     title: 'Success!',
 *     message: 'Your form has been submitted.'
 *   })
 * }
 * ```
 */
export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}
