import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hudson Digital Solutions',
  description: 'Revenue Operations & Business Automation Experts',
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <h1>Hudson Digital Solutions</h1>
      <p>Testing basic JSX compilation</p>
    </main>
  )
}