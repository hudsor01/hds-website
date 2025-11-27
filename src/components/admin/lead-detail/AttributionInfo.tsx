import { Download, Globe, TrendingUp } from 'lucide-react';
import type { Lead } from './types';

interface AttributionInfoProps {
  attribution: NonNullable<Lead['attribution']>;
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm break-all">{value}</p>
      </div>
    </div>
  );
}

export function AttributionInfo({ attribution }: AttributionInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Traffic Attribution</h3>
      <div className="space-y-3">
        <InfoItem
          icon={<TrendingUp className="h-5 w-5" />}
          label="Source / Medium"
          value={`${attribution.source} / ${attribution.medium}`}
        />
        {attribution.campaign && (
          <InfoItem icon={<Globe className="h-5 w-5" />} label="Campaign" value={attribution.campaign} />
        )}
        {attribution.device_type && (
          <InfoItem
            icon={<Download className="h-5 w-5" />}
            label="Device / Browser"
            value={`${attribution.device_type} / ${attribution.browser}`}
          />
        )}
        {attribution.referrer && (
          <InfoItem icon={<Globe className="h-5 w-5" />} label="Referrer" value={attribution.referrer} />
        )}
      </div>
    </div>
  );
}
