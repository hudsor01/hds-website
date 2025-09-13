import './globals.css'
import './print.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Paystub Generator | Hudson Digital Solutions',
  description: 'Generate professional paystubs with federal tax calculations',
}

export default function PaystubGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}