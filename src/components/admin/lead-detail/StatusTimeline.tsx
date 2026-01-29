'use client';

import type { Lead } from './types';

interface StatusTimelineProps {
  lead: Lead;
}

function TimelineItem({ color, label, date }: { color: 'green' | 'blue'; label: string; date: string }) {
  const bgColor = color === 'green' ? 'bg-success-muted dark:bg-success-bg-dark' : 'bg-info-muted dark:bg-info-bg-dark';
  const dotColor = color === 'green' ? 'bg-success-dark' : 'bg-info-dark';

  return (
    <div className="flex items-center gap-content">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${bgColor}`}>
        <div className={`h-3 w-3 rounded-full ${dotColor}`} />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{new Date(date).toLocaleString()}</p>
      </div>
    </div>
  );
}

export function StatusTimeline({ lead }: StatusTimelineProps) {
  if (!lead.contacted && !lead.converted) {return null;}

  return (
    <div className="space-y-content">
      <h3 className="text-lg font-semibold">Status Timeline</h3>
      <div className="space-y-3">
        <TimelineItem color="green" label="Lead Created" date={lead.created_at} />
        {lead.contacted && lead.contacted_at && (
          <TimelineItem color="blue" label="Contacted" date={lead.contacted_at} />
        )}
        {lead.converted && lead.converted_at && (
          <TimelineItem
            color="green"
            label={`Converted${lead.conversion_value ? ` - $${lead.conversion_value.toLocaleString()}` : ''}`}
            date={lead.converted_at}
          />
        )}
      </div>
    </div>
  );
}
