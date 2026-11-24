'use client'

/**
 * Shared PDF download flow for the document generators: one download at a
 * time, a loading flag for the button and a toast on success or failure.
 */
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

interface PdfDownloadRequest {
	/** Builds the PDF. Import @react-pdf/renderer inside it to keep it lazy. */
	createBlob: () => Promise<Blob>
	fileName: string
	/** Lower-case document name for messages, e.g. 'invoice'. */
	documentLabel: string
	onSuccess?: () => void
}

export function usePdfDownload() {
	const [isGenerating, setIsGenerating] = useState(false)
	const inFlight = useRef(false)

	const download = useCallback(
		async ({
			createBlob,
			fileName,
			documentLabel,
			onSuccess
		}: PdfDownloadRequest) => {
			if (inFlight.current) {
				return
			}
			inFlight.current = true
			setIsGenerating(true)
			try {
				const blob = await createBlob()
				const url = URL.createObjectURL(blob)
				const link = document.createElement('a')
				link.href = url
				link.download = fileName
				link.click()
				setTimeout(() => URL.revokeObjectURL(url), 10_000)
				toast.success(`Your ${documentLabel} PDF is downloading.`)
				onSuccess?.()
			} catch (error) {
				logger.error(`${documentLabel} PDF download failed`, error)
				toast.error(
					`The ${documentLabel} PDF could not be created. Please try again.`
				)
			} finally {
				inFlight.current = false
				setIsGenerating(false)
			}
		},
		[]
	)

	return { isGenerating, download }
}
