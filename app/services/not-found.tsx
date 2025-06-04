import Link from 'next/link'
import { ArrowLeft, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotFoundErrorFallback } from '@/components/error/error-fallbacks'

export default function ServicesNotFound() {
  return (
    <div className='min-h-[60vh] flex items-center justify-center px-4'>
      <div className='text-center max-w-lg'>
        <h1 className='text-6xl font-bold text-gray-300 mb-4'>404</h1>
        <h2 className='text-2xl font-semibold text-gray-700 mb-4'>
          Service Not Found
        </h2>
        <p className='text-gray-600 mb-8 max-w-md'>
          The service you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
          <Button asChild>
            <Link href='/services'>
              <Search className='mr-2 h-4 w-4' />
              Browse All Services
            </Link>
          </Button>
          <Button variant='outline' asChild>
            <Link href='/'>
              <Home className='mr-2 h-4 w-4' />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Available services */}
        <div className='p-4 bg-gray-50 rounded-lg'>
          <h3 className='text-sm font-medium text-gray-700 mb-3'>
            Available Services:
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/services/web-development'>Web Development</Link>
            </Button>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/services/revenue-operations'>Revenue Operations</Link>
            </Button>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/services/data-analytics'>Data Analytics</Link>
            </Button>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/contact'>Custom Solutions</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}