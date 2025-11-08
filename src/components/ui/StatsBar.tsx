interface Stat {
  value: string;
  label: string;
}

interface StatsBarProps {
  stats: Stat[];
  variant?: 'default' | 'bordered';
  valueColor?: string;
  columns?: 2 | 3 | 4;
}

export function StatsBar({
  stats,
  variant = 'default',
  valueColor = 'text-cyan-400',
  columns = 4,
}: StatsBarProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  const sectionClass = variant === 'bordered'
    ? 'py-12 px-4 border-y border-border'
    : 'py-12 px-4';

  return (
    <section className={sectionClass}>
      <div className="container-wide">
        <div className={`grid ${gridCols[columns]} gap-6 md:gap-8`}>
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-responsive-lg font-black ${valueColor}`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
