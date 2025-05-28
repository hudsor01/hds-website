import { NextRequest, NextResponse } from 'next/server'

// Example API route demonstrating different fetch configurations
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pattern = searchParams.get('pattern') || 'cached'

  try {
    switch (pattern) {
      case 'cached': {
        // Default: Next.js caches fetch responses automatically
        const cachedData = await fetch('https://jsonplaceholder.typicode.com/posts/1')
        const cachedResult = await cachedData.json()
        return NextResponse.json({
          pattern: 'cached',
          data: cachedResult,
          note: 'This response is cached by default in Next.js',
        })
      }

      case 'no-cache': {
        // Force no caching for dynamic data
        const dynamicData = await fetch('https://jsonplaceholder.typicode.com/posts/2', {
          cache: 'no-store',
        })
        const dynamicResult = await dynamicData.json()
        return NextResponse.json({
          pattern: 'no-cache',
          data: dynamicResult,
          note: 'This response is not cached and fetched on every request',
        })
      }

      case 'revalidate': {
        // Cache with revalidation
        const revalidatedData = await fetch('https://jsonplaceholder.typicode.com/posts/3', {
          next: { revalidate: 60 }, // Revalidate every 60 seconds
        })
        const revalidatedResult = await revalidatedData.json()
        return NextResponse.json({
          pattern: 'revalidate',
          data: revalidatedResult,
          note: 'This response is cached and revalidated every 60 seconds',
        })
      }

      case 'tags': {
        // Cache with tags for on-demand revalidation
        const taggedData = await fetch('https://jsonplaceholder.typicode.com/posts/4', {
          next: { tags: ['posts'] },
        })
        const taggedResult = await taggedData.json()
        return NextResponse.json({
          pattern: 'tags',
          data: taggedResult,
          note: 'This response is cached with tags for targeted revalidation',
        })
      }

      case 'parallel': {
        // Parallel fetch requests
        const [post1, post2, post3] = await Promise.all([
          fetch('https://jsonplaceholder.typicode.com/posts/1'),
          fetch('https://jsonplaceholder.typicode.com/posts/2'),
          fetch('https://jsonplaceholder.typicode.com/posts/3'),
        ])
        
        const parallelResults = await Promise.all([
          post1.json(),
          post2.json(),
          post3.json(),
        ])

        return NextResponse.json({
          pattern: 'parallel',
          data: parallelResults,
          note: 'Three requests executed in parallel for optimal performance',
        })
      }

      case 'sequential': {
        // Sequential fetch requests (for demonstration - usually not recommended)
        const seq1 = await fetch('https://jsonplaceholder.typicode.com/posts/1')
        const seqResult1 = await seq1.json()
        
        const seq2 = await fetch(`https://jsonplaceholder.typicode.com/users/${seqResult1.userId}`)
        const seqResult2 = await seq2.json()
        
        return NextResponse.json({
          pattern: 'sequential',
          data: { post: seqResult1, author: seqResult2 },
          note: 'Sequential requests where second depends on first result',
        })
      }

      case 'error-handling': {
        // Demonstrate error handling with Promise.allSettled
        const results = await Promise.allSettled([
          fetch('https://jsonplaceholder.typicode.com/posts/1'),
          fetch('https://invalid-url-that-will-fail.com/data'), // This will fail
          fetch('https://jsonplaceholder.typicode.com/posts/2'),
        ])

        const processedResults = results.map((result, index) => {
          if (result.status === 'fulfilled') {
            return {
              index,
              status: 'success',
              data: 'Response received (would need to parse JSON)',
            }
          } else {
            return {
              index,
              status: 'failed',
              error: result.reason.message,
            }
          }
        })

        return NextResponse.json({
          pattern: 'error-handling',
          data: processedResults,
          note: 'Using Promise.allSettled to handle partial failures gracefully',
        })
      }

      default:
        return NextResponse.json({
          error: 'Invalid pattern',
          availablePatterns: [
            'cached',
            'no-cache', 
            'revalidate',
            'tags',
            'parallel',
            'sequential',
            'error-handling',
          ],
        }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Fetch failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      pattern,
    }, { status: 500 })
  }
}

// Example of a POST route with different patterns
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Example: Update external service and invalidate cache
    const updateResponse = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store', // Don't cache POST requests
    })

    const result = await updateResponse.json()

    // In a real app, you might revalidate cached data here
    // revalidateTag('posts')

    return NextResponse.json({
      message: 'Data updated successfully',
      data: result,
      note: 'POST requests typically use cache: no-store',
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Update failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}