import { Building2, Calendar, Mail, Phone } from 'lucide-react';
import type { Lead } from './types';

interface ContactInfoProps {
  lead: Lead;
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

export function ContactInfo({ lead }: ContactInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contact Information</h3>
      <div className="space-y-3">
        <InfoItem icon={<Mail className="h-5 w-5" />} label="Email" value={lead.email} />
        {lead.phone && <InfoItem icon={<Phone className="h-5 w-5" />} label="Phone" value={lead.phone} />}
        {lead.company && <InfoItem icon={<Building2 className="h-5 w-5" />} label="Company" value={lead.company} />}
        <InfoItem icon={<Calendar className="h-5 w-5" />} label="Submitted" value={new Date(lead.created_at).toLocaleString()} />
      </div>
    </div>
  );
}
