'use client'

import { Check } from 'lucide-react'

interface SuccessMessageProps {
  onReset: () => void
  className?: string
}

export function SuccessMessage({ onReset, className = '' }: SuccessMessageProps) {
  return (
    <div className={`glass-card shadow-2xl card-padding-lg ${className}`}>
      <div className="text-center">
        <div className="inline-flex flex-center w-16 h-16 bg-success/20 rounded-full mb-content-block">
          <Check className="w-8 h-8 text-success-text" />
        </div>
        <h3 className="text-2xl font-bold text-primary-foreground mb-3">
          Message Sent Successfully!
        </h3>
        <p className="text-muted mb-content-block leading-relaxed">
          Thank you for reaching out. We&apos;ve received your message and will get back to you within 24 hours.
        </p>
        <button
          onClick={onReset}
          className="inline-flex items-center px-6 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/30 link-primary rounded-lg button-hover-glow"
        >
          Send Another Message
        </button>
      </div>
    </div>
  )
}