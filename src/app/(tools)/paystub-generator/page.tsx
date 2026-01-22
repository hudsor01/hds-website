import type { Metadata } from 'next'
import { Suspense } from 'react'

import { PaystubPageClient } from './PaystubPageClient'

export const metadata: Metadata = {
  title: 'Paystub Generator | Hudson Digital Solutions',
  description:
    'Generate accurate, printable pay stubs with validated payroll calculations, tax withholding estimates, and annual W-2 style summaries in seconds.',
}

function PaystubLoading() {
  return (
    <main className="section-spacing container-narrow">
      <div className="text-center space-y-tight mb-heading">
        <p className="text-sm font-semibold text-muted-foreground">Payroll Toolkit</p>
        <h1 className="text-4xl font-bold text-foreground">Paystub Generator</h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Loading calculator...
        </p>
      </div>
    </main>
  )
}

export default function PaystubGeneratorPage() {
  return (
    <Suspense fallback={<PaystubLoading />}>
      <PaystubPageClient />
    </Suspense>
  )
}
