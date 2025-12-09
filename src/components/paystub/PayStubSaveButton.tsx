import React from 'react'
import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PayStubSaveButtonProps {
  onSave: () => void
}

export const PayStubSaveButton: React.FC<PayStubSaveButtonProps> = ({ onSave }) => {
  return (
    <div className="no-print absolute -top-16 right-0 z-modal">
      <button
        onClick={onSave}
        className={cn(
          "flex items-center gap-tight px-6 py-3 rounded-md text-sm font-semibold transition-smooth",
          "bg-accent text-foreground border-0 shadow-xs cursor-pointer",
          "hover:bg-accent/90 focus-ring"
        )}
      >
        <FileText className="w-4 h-4" />
        Save as PDF
      </button>
    </div>
  )
}