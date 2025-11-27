'use client'

import { Check } from 'lucide-react'

interface SuccessMessageProps {
  onReset: () => void
  className?: string
}

export function SuccessMessage({ onReset, className = '' }: SuccessMessageProps) {
  return (
    <div className={`glass-card shadow-2xl p-8 ${className}`}>
      <div className="text-center">
        <div className="inline-flex flex-center w-16 h-16 bg-green-500/20 rounded-full mb-6">
          <Check className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">
          Message Sent Successfully!
        </h3>
        <p className="text-muted mb-6 leading-relaxed">
          Thank you for reaching out. We&apos;ve received your message and will get back to you within 24 hours.
        </p>
        <button
          onClick={onReset}
          className="inline-flex items-center px-6 py-3 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 link-primary rounded-lg button-hover-glow"
        >
          Send Another Message
        </button>
      </div>
    </div>
  )
}