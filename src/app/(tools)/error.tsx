'use client'

import { useEffect } from 'react'
import { Card } from "@/components/ui/card";
import Link from 'next/link'
import { createServerLogger } from '@/lib/logger'
import { castError } from '@/lib/utils/errors'
import { Button } from '@/components/ui/button'

export default function ToolsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    const logger = createServerLogger('tools-segment')
    logger.error('Tools segment error boundary triggered', castError(error))
  }, [error])

  return (
    <div className="min-h-screen flex-center px-6 py-section">
      <Card variant="glass" size="lg" className="max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold text-foreground mb-subheading">Something went wrong</h1>
        <p className="text-muted-foreground mb-content-block">
          The tools experience hit a snag. Please try again or return to the homepage while we investigate.
        </p>

        {error.digest && (
          <p className="text-xs font-mono text-muted-foreground mb-content-block">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex justify-center gap-3">
          <Button onClick={reset} variant="default">Try again</Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
