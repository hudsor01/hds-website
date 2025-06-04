import { cookies } from 'next/headers'
import React from 'react'
/**
 * User Profile component that demonstrates PPR dynamic rendering
 * Uses cookies API which makes it dynamic
 */
export async function UserProfile() {
  // This makes the component dynamic due to cookies usage
  const session = (await cookies()).get('session')?.value
  const userPreferences = (await cookies()).get('user-preferences')?.value

  // Simulate loading time for dynamic content
  await new Promise(resolve => setTimeout(resolve, 300))

  return (
    <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border'>
      <h3 className='text-lg font-semibold text-gray-800 mb-3'>User Profile</h3>
      {session ? (
        <div className='space-y-2'>
          <p className='text-green-600'>✓ Authenticated user</p>
          <p className='text-sm text-gray-600'>
            Session: {session.substring(0, 8)}...
          </p>
          {userPreferences && (
            <p className='text-sm text-gray-600'>
              Preferences: {userPreferences}
            </p>
          )}
          <div className='text-xs text-gray-500 mt-2'>
            This content was rendered dynamically using cookies
          </div>
        </div>
      ) : (
        <div className='space-y-2'>
          <p className='text-orange-600'>⚠ Guest user</p>
          <p className='text-sm text-gray-600'>
            No session cookie found
          </p>
          <div className='text-xs text-gray-500 mt-2'>
            This content was rendered dynamically
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Skeleton component for UserProfile loading state
 */
export function UserProfileSkeleton() {
  return (
    <div className='bg-gray-50 p-6 rounded-lg border animate-pulse'>
      <div className='h-5 bg-gray-200 rounded w-1/3 mb-3'></div>
      <div className='space-y-2'>
        <div className='h-4 bg-gray-200 rounded w-1/2'></div>
        <div className='h-4 bg-gray-200 rounded w-2/3'></div>
        <div className='h-3 bg-gray-200 rounded w-1/4 mt-2'></div>
      </div>
    </div>
  )
}