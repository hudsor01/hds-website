/**
 * Trend Line Chart Component
 * CSS and SVG-based line chart without external dependencies
 */

'use client';

interface DataPoint {
  date: string;
  value: number;
}

interface DataSet {
  data: DataPoint[];
  label: string;
  color: string;
}

interface TrendLineChartProps {
  datasets: DataSet[];
  title: string;
  showPoints?: boolean;
  height?: number;
}

export function TrendLineChart({
  datasets,
  title,
  showPoints = true,
  height = 200,
}: TrendLineChartProps) {
  if (datasets.length === 0 || datasets.every(d => d.data.length === 0)) {
    return (
      <div className="rounded-lg border border-border bg-card card-padding dark:border-border dark:bg-muted">
        <h3 className="mb-content-block text-lg font-semibold text-foreground dark:text-foreground">
          {title}
        </h3>
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            No data available
          </p>
        </div>
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const width = 800;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = datasets.flatMap(d => d.data.map(p => p.value));
  const minValue = Math.min(...allValues, 0);
  const maxValue = Math.max(...allValues, 1);
  const valueRange = maxValue - minValue || 1;

  const allDates = [...new Set(datasets.flatMap(d => d.data.map(p => p.date)))].sort();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const labelInterval = Math.ceil(allDates.length / 6);
  const xLabels = allDates.filter((_, i) => i % labelInterval === 0 || i === allDates.length - 1);

  return (
    <div className="rounded-lg border border-border bg-card card-padding dark:border-border dark:bg-muted">
      <h3 className="mb-content-block text-lg font-semibold text-foreground dark:text-foreground">
        {title}
      </h3>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ minWidth: '600px' }}
        >
          {datasets.map(dataset => (
            <defs key={dataset.label}>
              <linearGradient id={`gradient-${dataset.label}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={dataset.color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={dataset.color} stopOpacity="0.05" />
              </linearGradient>
            </defs>
          ))}

          {[0, 0.25, 0.5, 0.75, 1].map((percent, i) => {
            const y = padding.top + chartHeight - percent * chartHeight;
            const value = Math.round(minValue + valueRange * percent);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="currentColor"
                  className="stroke-gray-200 dark:stroke-gray-700"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-gray-500 text-xs dark:fill-gray-400"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {xLabels.map((date, i) => {
            const index = allDates.indexOf(date);
            const x = padding.left + (index / (allDates.length - 1)) * chartWidth;
            return (
              <text
                key={i}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="fill-gray-500 text-xs dark:fill-gray-400"
              >
                {formatDate(date)}
              </text>
            );
          })}

          {datasets.map(dataset => {
            const pathPoints = dataset.data.map(point => {
              const index = allDates.indexOf(point.date);
              const x = padding.left + (index / (allDates.length - 1)) * chartWidth;
              const y = padding.top + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
              return { x, y, ...point };
            });

            const linePath = pathPoints
              .map((point, index) => {
                if (index === 0) {return `M ${point.x} ${point.y}`;}
                return `L ${point.x} ${point.y}`;
              })
              .join(' ');
            
            const lastPoint = pathPoints[pathPoints.length - 1];
            const areaPath = lastPoint ? `${linePath} L ${lastPoint.x} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z` : '';

            return (
              <g key={dataset.label}>
                <path d={areaPath} fill={`url(#gradient-${dataset.label})`} />
                <path
                  d={linePath}
                  fill="none"
                  stroke={dataset.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {showPoints &&
                  pathPoints.map((point, i) => (
                    <g key={i}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill="white"
                        stroke={dataset.color}
                        strokeWidth="2"
                        className="transition-all hover:r-6"
                      />
                      <title>{formatDate(point.date)}: {point.value}</title>
                    </g>
                  ))}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-4 flex items-center justify-center gap-content border-t border-border pt-4 dark:border-border">
        {datasets.map(dataset => (
          <div key={dataset.label} className="flex items-center gap-tight text-sm">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: dataset.color }} />
            <span className="text-muted-foreground dark:text-muted-foreground">{dataset.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

