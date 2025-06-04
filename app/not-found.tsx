import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layouts/header'
import { Footer } from '@/components/layouts/footer'

export const metadata: Metadata = {
  title: '404 - Page Not Found | Hudson Digital Solutions',
  description: 'The page you are looking for could not be found. Return to our homepage or contact us for assistance.',
  robots: 'noindex, nofollow',
}

export default function NotFound() {
  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      
      <main className='flex-1 flex items-center justify-center px-4 py-16'>
        <div className='text-center max-w-md'>
          <div className='mb-8'>
            <h1 className='text-6xl font-bold text-primary mb-2'>404</h1>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>Page Not Found</h2>
            <p className='text-muted-foreground mb-8'>
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>
          
          <div className='space-y-4'>
            <Button asChild className='w-full'>
              <Link href='/'>
                Return Home
              </Link>
            </Button>
            
            <Button variant='outline' asChild className='w-full'>
              <Link href='/contact'>
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}