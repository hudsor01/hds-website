/**
 * Search Results component that uses searchParams (dynamic)
 * Demonstrates passing dynamic props in PPR
 */
export async function SearchResults({ 
  searchParams, 
}: { 
  searchParams: Promise<{ q?: string; sort?: string; limit?: string }> 
}) {
  // Accessing searchParams makes this component dynamic
  const params = await searchParams
  const query = params.q || ''
  const sort = params.sort || 'relevance'
  const limit = parseInt(params.limit || '10')

  // Simulate search API call
  await new Promise(resolve => setTimeout(resolve, 500))

  // Mock search results
  const results = Array.from({ length: Math.min(limit, 8) }, (_, i) => ({
    id: i + 1,
    title: `${query ? `${query} related ` : ''}Result ${i + 1}`,
    description: `This is a description for search result ${i + 1}. It contains relevant information about the query.`,
    url: `/results/${i + 1}`,
    relevance: Math.random(),
  }))

  // Sort results based on parameter
  if (sort === 'date') {
    results.sort((a, b) => b.id - a.id)
  } else if (sort === 'relevance') {
    results.sort((a, b) => b.relevance - a.relevance)
  }

  return (
    <div className='bg-white p-6 rounded-lg border shadow-sm'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-semibold text-gray-800'>
          Search Results
        </h3>
        <span className='text-sm text-gray-500'>
          {results.length} results
        </span>
      </div>

      {query && (
        <div className='mb-4 p-3 bg-blue-50 rounded-md'>
          <p className='text-blue-800 text-sm'>
            Showing results for: <strong>&apos;{query}&apos;</strong>
          </p>
          <p className='text-blue-600 text-xs mt-1'>
            Sorted by: {sort} | Limit: {limit}
          </p>
        </div>
      )}

      <div className='space-y-4'>
        {results.map((result) => (
          <div key={result.id} className='border-l-4 border-blue-200 pl-4'>
            <h4 className='font-medium text-gray-900 hover:text-blue-600 cursor-pointer'>
              {result.title}
            </h4>
            <p className='text-sm text-gray-600 mt-1'>
              {result.description}
            </p>
            <div className='flex justify-between items-center mt-2'>
              <span className='text-xs text-blue-600 hover:underline cursor-pointer'>
                {result.url}
              </span>
              <span className='text-xs text-gray-400'>
                Relevance: {Math.round(result.relevance * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className='text-xs text-gray-500 mt-4 pt-4 border-t'>
        This content was rendered dynamically based on searchParams
      </div>
    </div>
  )
}

/**
 * Skeleton component for SearchResults loading state
 */
export function SearchResultsSkeleton() {
  return (
    <div className='bg-white p-6 rounded-lg border shadow-sm animate-pulse'>
      <div className='flex justify-between items-center mb-4'>
        <div className='h-5 bg-gray-200 rounded w-1/3'></div>
        <div className='h-4 bg-gray-200 rounded w-16'></div>
      </div>

      <div className='mb-4 p-3 bg-gray-50 rounded-md'>
        <div className='h-4 bg-gray-200 rounded w-1/2 mb-2'></div>
        <div className='h-3 bg-gray-200 rounded w-1/3'></div>
      </div>

      <div className='space-y-4'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='border-l-4 border-gray-200 pl-4'>
            <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
            <div className='h-3 bg-gray-200 rounded w-full mb-2'></div>
            <div className='flex justify-between items-center'>
              <div className='h-3 bg-gray-200 rounded w-1/4'></div>
              <div className='h-3 bg-gray-200 rounded w-16'></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}