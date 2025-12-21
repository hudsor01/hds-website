/**
 * Error Detail Modal Component
 * Shows detailed error information in a dialog
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { logger } from '@/lib/logger';
import type { ErrorLogRecord, GroupedError } from '@/types/error-logging';
import { format } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface ErrorDetailModalProps {
  error: GroupedError | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (fingerprint: string, resolved: boolean) => void;
}

export function ErrorDetailModal({
  error,
  isOpen,
  onClose,
  onResolve,
}: ErrorDetailModalProps) {
  const [occurrences, setOccurrences] = useState<ErrorLogRecord[]>([]);
  const [isLoadingOccurrences, setIsLoadingOccurrences] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  if (!error) {
    return null;
  }

  const handleOpenChange = async (open: boolean) => {
    if (open && occurrences.length === 0) {
      setIsLoadingOccurrences(true);
      try {
        const response = await fetch(
          `/api/admin/errors/occurrences?fingerprint=${error.fingerprint}`
        );
        const data = await response.json();
        setOccurrences(data.occurrences || []);
      } catch (err) {
        logger.error('Failed to fetch error occurrences:', err as Error);
      } finally {
        setIsLoadingOccurrences(false);
      }
    }

    if (!open) {
      onClose();
    }
  };

  const handleResolveToggle = async () => {
    setIsResolving(true);
    try {
      const response = await fetch(`/api/admin/errors/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fingerprint: error.fingerprint,
          resolved: !error.resolved_at,
        }),
      });

      if (response.ok) {
        onResolve(error.fingerprint, !error.resolved_at);
        onClose();
      }
    } catch (err) {
      logger.error('Failed to update error status:', err as Error);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{error.error_type}</DialogTitle>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{error.count} occurrences</span>
            <span>•</span>
            <span
              className={
                error.level === 'fatal'
                  ? 'text-destructive-dark'
                  : 'text-warning-dark'
              }
            >
              {error.level}
            </span>
          </div>
        </DialogHeader>

        {/* Message */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground dark:text-foreground">
            Message
          </h3>
          <p className="text-sm text-secondary-foreground dark:text-secondary-foreground">
            {error.message}
          </p>
        </div>

        {/* Timestamps */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground dark:text-foreground">
              First Seen
            </h3>
            <p className="text-sm text-secondary-foreground dark:text-secondary-foreground">
              {format(new Date(error.first_seen), 'PPpp')}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground dark:text-foreground">
              Last Seen
            </h3>
            <p className="text-sm text-secondary-foreground dark:text-secondary-foreground">
              {format(new Date(error.last_seen), 'PPpp')}
            </p>
          </div>
        </div>

        {/* Stack Trace */}
        {occurrences.length > 0 && occurrences[0]?.stack_trace && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground dark:text-foreground">
              Stack Trace
            </h3>
            <pre className="overflow-x-auto rounded-md bg-muted dark:bg-background p-4 text-xs">
              <code>{occurrences[0]?.stack_trace}</code>
            </pre>
          </div>
        )}

        {/* Recent Occurrences */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground dark:text-foreground">
            Recent Occurrences
          </h3>
          {isLoadingOccurrences ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Loading occurrences...
            </div>
          ) : (
            <div className="space-y-2">
              {occurrences.slice(0, 10).map((occurrence) => (
                <div
                  key={occurrence.id}
                  className="rounded-md border border-border p-3 dark:border-border"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(occurrence.created_at), 'PPpp')}
                    </span>
                    {occurrence.route && (
                      <span className="text-xs font-mono text-muted-foreground">
                        {occurrence.route}
                      </span>
                    )}
                  </div>
                  {occurrence.user_email && (
                    <div className="mt-1 text-xs text-secondary-foreground dark:text-secondary-foreground">
                      User: {occurrence.user_email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-border pt-4 dark:border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={handleResolveToggle}
            disabled={isResolving}
            variant={error.resolved_at ? 'destructive' : 'default'}
          >
            {error.resolved_at ? (
              <>
                <XCircle className="h-4 w-4" />
                Mark Unresolved
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Mark Resolved
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
