'use client'

import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PayStubSaveButtonProps {
	onSave: () => void
}

export function PayStubSaveButton({ onSave }: PayStubSaveButtonProps) {
	return (
		<div className="no-print absolute -top-16 right-0 z-modal">
			<Button
				type="button"
				onClick={onSave}
				variant="default"
				className={cn('px-6')}
			>
				<FileText className="w-4 h-4" />
				Save as PDF
			</Button>
		</div>
	)
}
