/**
 * Error List Component
 * Displays grouped errors with status indicators
 */

'use client';

import type { GroupedError } from '@/types/error-logging';
import { formatDistanceToNow } from 'date-fns';

interface ErrorListProps {
  errors: GroupedError[];
  onErrorClick: (error: GroupedError) => void;
}

export function ErrorList({ errors, onErrorClick }: ErrorListProps) {
  if (errors.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-secondary-foreground dark:text-secondary-foreground">
          No errors found
        </p>
      </div>
    );
  }

  const getStatusColor = (error: GroupedError): string => {
    if (error.resolved_at) {
      return 'bg-muted-foreground';
    }
    if (error.level === 'fatal') {
      return 'bg-destructive-dark';
    }
    return 'bg-warning-dark';
  };

  const getStatusLabel = (error: GroupedError): string => {
    if (error.resolved_at) {
      return 'Resolved';
    }
    if (error.level === 'fatal') {
      return 'Fatal';
    }
    return 'Error';
  };

  return (
    <div className="divide-y divide-border dark:divide-border">
      {errors.map((error) => (
        <div
          key={error.fingerprint}
          onClick={() => onErrorClick(error)}
          className="cursor-pointer p-4 hover:bg-muted dark:hover:bg-muted transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                {/* Status Indicator */}
                <div
                  className={`h-2 w-2 rounded-full shrink-0 ${getStatusColor(error)}`}
                  title={getStatusLabel(error)}
                />

                {/* Error Type */}
                <h3 className="font-semibold text-foreground dark:text-foreground truncate">
                  {error.error_type}
                </h3>

                {/* Occurrence Count */}
                <span className="text-sm font-medium text-muted-foreground shrink-0">
                  {error.count}×
                </span>
              </div>

              {/* Error Message */}
              <p className="mt-1 text-sm text-secondary-foreground dark:text-secondary-foreground line-clamp-2">
                {error.message}
              </p>

              {/* Route if available */}
              {error.route && (
                <p className="mt-1 text-xs text-muted-foreground font-mono">
                  {error.route}
                </p>
              )}
            </div>

            {/* Time since last occurrence */}
            <div className="text-xs text-muted-foreground shrink-0">
              {formatDistanceToNow(new Date(error.last_seen), { addSuffix: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
