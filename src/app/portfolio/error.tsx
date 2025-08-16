'use client';

import ErrorPage from '@/components/shared/ErrorPage';

export default function PortfolioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorPage error={error} reset={reset} pageType="portfolio" />;
}