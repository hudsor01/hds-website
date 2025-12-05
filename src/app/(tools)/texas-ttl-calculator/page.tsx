import { Suspense } from 'react'
import { Calculator } from '@/components/Calculator'
import { CalculatorProvider } from '@/providers/CalculatorProvider'
import './print.css'

function TTLCalculatorContent() {
  return (
    <CalculatorProvider>
      <Calculator />
    </CalculatorProvider>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-border border-t-cyan-500" />
      </div>
    }>
      <TTLCalculatorContent />
    </Suspense>
  );
}
