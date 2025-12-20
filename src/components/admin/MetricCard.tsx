/**
 * Metric Card Component
 * Displays a single KPI metric with trend indicator
 */

'use client';

import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: ReactNode;
  subtitle?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  subtitle,
}: MetricCardProps) {
  const changeColors = {
    increase: 'text-success-dark dark:text-success-text',
    decrease: 'text-destructive-dark dark:text-destructive-text',
    neutral: 'text-muted-foreground dark:text-muted-foreground',
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground dark:text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
              {subtitle}
            </p>
          )}
          {change && (
            <p className={`mt-2 text-sm font-medium ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20 dark:bg-primary-hover">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
