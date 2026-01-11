/**
 * Error Stats Component
 * Displays error monitoring metrics using MetricCard
 */


import { MetricCard } from '@/components/admin/MetricCard';
import type { ErrorStats } from '@/types/error-logging';
import { AlertTriangle, Bug, CheckCircle, XCircle } from 'lucide-react';

interface ErrorStatsProps {
  stats: ErrorStats;
  isLoading?: boolean;
}

export function ErrorStats({ stats, isLoading = false }: ErrorStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Errors"
        value={stats.total_errors}
        subtitle="All time"
        icon={<Bug className="h-6 w-6 text-primary" />}
      />

      <MetricCard
        title="Unique Types"
        value={stats.unique_types}
        subtitle="Error patterns"
        icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />}
      />

      <MetricCard
        title="Fatal Errors"
        value={stats.fatal_count}
        subtitle="Requires attention"
        icon={<XCircle className="h-6 w-6 text-red-500" />}
      />

      <MetricCard
        title="Unresolved"
        value={stats.unresolved_count}
        subtitle={`${stats.resolved_count} resolved`}
        icon={<CheckCircle className="h-6 w-6 text-green-500" />}
      />
    </div>
  );
}
