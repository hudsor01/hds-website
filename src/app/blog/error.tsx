'use client';

import ErrorPage from '@/components/shared/ErrorPage';

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorPage error={error} reset={reset} pageType="blog" />;
}