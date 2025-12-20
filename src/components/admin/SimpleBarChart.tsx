/**
 * Simple Bar Chart Component
 * CSS-based bar chart without external dependencies
 */

'use client';

import { Card } from '@/components/ui/card';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: DataPoint[];
  title: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export function SimpleBarChart({
  data,
  title,
  valuePrefix = '',
  valueSuffix = '',
}: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <Card>
      <h3 className="mb-content-block text-lg font-semibold text-foreground dark:text-foreground">
        {title}
      </h3>

      <div className="space-y-content">
        {data.map((item, index) => (
          <div key={index}>
            <div className="mb-subheading flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground dark:text-muted">
                {item.label}
              </span>
              <span className="font-semibold text-foreground dark:text-foreground">
                {valuePrefix}{item.value}{valueSuffix}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary dark:bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 dark:bg-accent"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            No data available
          </p>
        </div>
      )}
    </Card>
  );
}
