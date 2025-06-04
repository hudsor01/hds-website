import { headers } from 'next/headers';

/**
 * Analytics Widget that uses headers (dynamic)
 * Shows real-time data based on request headers
 */
export async function AnalyticsWidget() {
  // Using headers makes this component dynamic
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || 'Unknown';
  const acceptLanguage = headersList.get('accept-language') || 'en';
  const referer = headersList.get('referer') || 'Direct';

  // Simulate analytics API call
  await new Promise(resolve => setTimeout(resolve, 400));

  // Mock analytics data based on headers
  const isBot = /bot|crawler|spider/i.test(userAgent);
  const isMobile = /mobile/i.test(userAgent);
  const primaryLanguage = acceptLanguage.split(',')[0]?.split('-')[0] || 'en';

  const mockStats = {
    currentVisitors: Math.floor(Math.random() * 50) + 10,
    pageViews: Math.floor(Math.random() * 1000) + 500,
    bounceRate: Math.floor(Math.random() * 30) + 20,
    avgSessionDuration: Math.floor(Math.random() * 300) + 120,
  };

  return (
    <div className='bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200'>
      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
        Live Analytics
      </h3>

      <div className='grid grid-cols-2 gap-4 mb-4'>
        <div className='text-center p-3 bg-white rounded-md'>
          <div className='text-2xl font-bold text-green-600'>
            {mockStats.currentVisitors}
          </div>
          <div className='text-xs text-gray-500'>Active Users</div>
        </div>
        <div className='text-center p-3 bg-white rounded-md'>
          <div className='text-2xl font-bold text-blue-600'>
            {mockStats.pageViews}
          </div>
          <div className='text-xs text-gray-500'>Page Views</div>
        </div>
        <div className='text-center p-3 bg-white rounded-md'>
          <div className='text-2xl font-bold text-orange-600'>
            {mockStats.bounceRate}%
          </div>
          <div className='text-xs text-gray-500'>Bounce Rate</div>
        </div>
        <div className='text-center p-3 bg-white rounded-md'>
          <div className='text-2xl font-bold text-purple-600'>
            {Math.floor(mockStats.avgSessionDuration / 60)}m
          </div>
          <div className='text-xs text-gray-500'>Avg. Session</div>
        </div>
      </div>

      <div className='space-y-2 text-sm'>
        <div className='flex justify-between'>
          <span className='text-gray-600'>Device Type:</span>
          <span className={`font-medium ${isMobile ? 'text-blue-600' : 'text-gray-800'}`}>
            {isMobile ? 'Mobile' : 'Desktop'}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='text-gray-600'>Language:</span>
          <span className='font-medium text-gray-800'>{primaryLanguage}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-gray-600'>Traffic Source:</span>
          <span className='font-medium text-gray-800'>
            {referer === 'Direct' ? 'Direct' : 'Referral'}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='text-gray-600'>Bot Detection:</span>
          <span className={`font-medium ${isBot ? 'text-red-600' : 'text-green-600'}`}>
            {isBot ? 'Bot' : 'Human'}
          </span>
        </div>
      </div>

      <div className='text-xs text-gray-500 mt-4 pt-4 border-t border-green-200'>
        Data updated in real-time using request headers
      </div>
    </div>
  );
}

/**
 * Skeleton component for AnalyticsWidget loading state
 */
export function AnalyticsWidgetSkeleton() {
  return (
    <div className='bg-gray-50 p-6 rounded-lg border animate-pulse'>
      <div className='h-5 bg-gray-200 rounded w-1/3 mb-4'></div>

      <div className='grid grid-cols-2 gap-4 mb-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='text-center p-3 bg-white rounded-md'>
            <div className='h-6 bg-gray-200 rounded w-12 mx-auto mb-2'></div>
            <div className='h-3 bg-gray-200 rounded w-16 mx-auto'></div>
          </div>
        ))}
      </div>

      <div className='space-y-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='flex justify-between'>
            <div className='h-4 bg-gray-200 rounded w-1/3'></div>
            <div className='h-4 bg-gray-200 rounded w-1/4'></div>
          </div>
        ))}
      </div>
    </div>
  );
}