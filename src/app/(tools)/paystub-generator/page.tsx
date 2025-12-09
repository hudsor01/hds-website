import type { Metadata } from 'next'

import { PaystubPageClient } from './PaystubPageClient'

export const metadata: Metadata = {
  title: 'Paystub Generator | Hudson Digital Solutions',
  description:
    'Generate accurate, printable pay stubs with validated payroll calculations, tax withholding estimates, and annual W-2 style summaries in seconds.',
}

export default function PaystubGeneratorPage() {
  return <PaystubPageClient />
}
