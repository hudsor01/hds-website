import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Lead } from './types';

interface LeadScoreCardProps {
  lead: Lead;
}

export function LeadScoreCard({ lead }: LeadScoreCardProps) {
  const getVariant = (quality: string) => {
    switch (quality) {
      case 'hot': return 'destructive' as const;
      case 'warm': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  return (
    <Card size="sm" className="bg-muted">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Lead Score</p>
          <p className="mt-1 text-3xl font-bold">{lead.lead_score}/100</p>
        </div>
        <Badge variant={getVariant(lead.lead_quality)} className="text-sm">
          {lead.lead_quality.toUpperCase()} LEAD
        </Badge>
      </div>
    </Card>
  );
}
