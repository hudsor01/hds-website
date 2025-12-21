/**
 * Error Filters Component
 * Filter controls for error monitoring
 */

'use client';

import { Calendar, Filter, Search, X } from 'lucide-react';

interface ErrorFiltersProps {
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
  errorType: string;
  onErrorTypeChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  errorTypes: string[];
}

export function ErrorFilters({
  timeRange,
  onTimeRangeChange,
  errorType,
  onErrorTypeChange,
  searchQuery,
  onSearchQueryChange,
  errorTypes,
}: ErrorFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search errors..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="w-full rounded-md border-border-primary py-2 pl-10 pr-10 text-sm focus:border-primary focus:ring-primary dark:border-border-primary-dark dark:bg-bg-secondary-dark dark:text-foreground dark:placeholder-text-muted"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchQueryChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary-foreground dark:hover:text-secondary-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Time Range Dropdown */}
        <div className="flex items-center gap-tight">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="rounded-md border-border-primary py-2 pl-3 pr-10 text-sm focus:border-primary focus:ring-primary dark:border-border-primary-dark dark:bg-bg-secondary-dark dark:text-foreground"
          >
            <option value="1">Last 1 hour</option>
            <option value="24">Last 24 hours</option>
            <option value="168">Last 7 days</option>
            <option value="720">Last 30 days</option>
          </select>
        </div>

        {/* Error Type Dropdown */}
        <div className="flex items-center gap-tight">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <select
            value={errorType}
            onChange={(e) => onErrorTypeChange(e.target.value)}
            className="rounded-md border-border py-2 pl-3 pr-10 text-sm focus:border-primary focus:ring-primary dark:border-border dark:bg-muted dark:text-foreground"
          >
            <option value="all">All Types</option>
            {errorTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
