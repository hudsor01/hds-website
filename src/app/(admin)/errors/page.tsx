/**
 * Admin Error Monitoring Page
 * Real-time error tracking and management
 */

'use client';

import { ErrorDetailModal } from '@/components/admin/errors/ErrorDetailModal';
import { ErrorFilters } from '@/components/admin/errors/ErrorFilters';
import { ErrorList } from '@/components/admin/errors/ErrorList';
import { ErrorStats } from '@/components/admin/errors/ErrorStats';
import { Card } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import type { ErrorStats as ErrorStatsType, GroupedError } from '@/types/error-logging';
import { useCallback, useEffect, useState } from 'react';

interface ErrorsResponse {
  stats: ErrorStatsType;
  errors: GroupedError[];
}

export default function ErrorsPage() {
  const [stats, setStats] = useState<ErrorStatsType | null>(null);
  const [errors, setErrors] = useState<GroupedError[]>([]);
  const [filteredErrors, setFilteredErrors] = useState<GroupedError[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<GroupedError | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state
  const [timeRange, setTimeRange] = useState('24');
  const [errorType, setErrorType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch errors
  const fetchErrors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/errors?hours=${timeRange}`);
      const data: ErrorsResponse = await response.json();

      setStats(data.stats);
      setErrors(data.errors || []);
    } catch (error) {
      logger.error('Failed to fetch errors:', error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    void fetchErrors();
  }, [fetchErrors]);

  // Client-side filtering
  useEffect(() => {
    let filtered = [...errors];

    // Filter by error type
    if (errorType !== 'all') {
      filtered = filtered.filter((error) => error.error_type === errorType);
    }

    // Filter by search query
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (error) =>
          error.error_type.toLowerCase().includes(query) ||
          error.message.toLowerCase().includes(query) ||
          error.route?.toLowerCase().includes(query)
      );
    }

    setFilteredErrors(filtered);
  }, [errors, errorType, debouncedSearch]);

  // Handle error click
  const handleErrorClick = (error: GroupedError) => {
    setSelectedError(error);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedError(null);
  };

  // Handle resolve/unresolve
  const handleResolve = (fingerprint: string, resolved: boolean) => {
    setErrors((prevErrors) =>
      prevErrors.map((error) =>
        error.fingerprint === fingerprint
          ? {
              ...error,
              resolved_at: resolved ? new Date().toISOString() : undefined,
            }
          : error
      )
    );

    // Refresh stats
    void fetchErrors();
  };

  // Get unique error types for filter
  const errorTypes = Array.from(
    new Set(errors.map((error) => error.error_type))
  ).sort();

  return (
    <div className="min-h-screen bg-muted dark:bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card dark:border-border dark:bg-muted">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-foreground">
              Error Monitoring
            </h1>
            <p className="mt-1 text-sm text-secondary-foreground dark:text-secondary-foreground">
              Track and resolve application errors
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8">
          <ErrorStats stats={stats || {
            total_errors: 0,
            unique_types: 0,
            fatal_count: 0,
            resolved_count: 0,
            unresolved_count: 0,
          }} isLoading={isLoading} />
        </div>

        {/* Filters */}
        <Card size="sm" className="mb-content-block">
          <ErrorFilters
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            errorType={errorType}
            onErrorTypeChange={setErrorType}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            errorTypes={errorTypes}
          />
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-sm text-secondary-foreground dark:text-secondary-foreground">
          Showing {filteredErrors.length} of {errors.length} errors
        </div>

        {/* Error List */}
        <Card size="none">
          <div className="border-b border-border p-4 dark:border-border">
            <h3 className="text-lg font-semibold text-foreground dark:text-foreground">
              Error Groups
            </h3>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-secondary-foreground dark:text-secondary-foreground">
                  Loading errors...
                </p>
              </div>
            </div>
          ) : (
            <ErrorList errors={filteredErrors} onErrorClick={handleErrorClick} />
          )}
        </Card>
      </div>

      {/* Error Detail Modal */}
      <ErrorDetailModal
        error={selectedError}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onResolve={handleResolve}
      />
    </div>
  );
}
