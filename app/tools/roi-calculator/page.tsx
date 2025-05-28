import type { Metadata } from 'next'
import { ROICalculator } from './roi-calculator'

export const metadata: Metadata = {
  title: 'ROI Calculator | Revenue Operations Investment Return | Hudson Digital',
  description: 'Calculate your potential return on investment from revenue operations automation. See how much revenue you could gain and costs you could save.',
  keywords: 'ROI calculator, revenue operations ROI, sales automation ROI, CRM ROI calculator, business automation calculator',
}

export default function ROICalculatorPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Revenue Operations ROI Calculator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Calculate your potential return on investment from implementing revenue operations automation. 
            See how much revenue you could gain and costs you could save with our expert services.
          </p>
        </div>
        
        <ROICalculator />
      </div>
    </main>
  )
}