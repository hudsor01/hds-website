import type { Metadata } from 'next'
import { ConsultationBooking } from '@/components/booking/cal-com-widget'

export const metadata: Metadata = {
  title: 'Book Free Consultation | Revenue Operations Expert | Hudson Digital',
  description: 'Schedule your free consultation with our revenue operations expert. Get personalized advice on automating your sales process and growing your business.',
  keywords: 'book consultation, revenue operations consultant, free consultation, sales automation advice',
}

export default function BookConsultationPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <ConsultationBooking />
      </div>
    </main>
  )
}