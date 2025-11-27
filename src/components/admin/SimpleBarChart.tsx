/**
 * Simple Bar Chart Component
 * CSS-based bar chart without external dependencies
 */

'use client';

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
    <div className="rounded-lg border border-border bg-white p-6 dark:border-border dark:bg-muted">
      <h3 className="mb-6 text-lg font-semibold text-foreground dark:text-white">
        {title}
      </h3>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground dark:text-muted">
                {item.label}
              </span>
              <span className="font-semibold text-foreground dark:text-white">
                {valuePrefix}{item.value}{valueSuffix}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-muted">
              <div
                className="h-full rounded-full bg-cyan-600 transition-all duration-500 dark:bg-cyan-400"
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
    </div>
  );
}
