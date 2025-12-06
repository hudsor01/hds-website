/**
 * Lead Detail Modal
 * Composes smaller components for lead information display
 */

'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { logger } from '@/lib/logger';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { AttributionInfo } from './lead-detail/AttributionInfo';
import { CalculatorDetails } from './lead-detail/CalculatorDetails';
import { ContactInfo } from './lead-detail/ContactInfo';
import { LeadScoreCard } from './lead-detail/LeadScoreCard';
import { NotesSection } from './lead-detail/NotesSection';
import { StatusTimeline } from './lead-detail/StatusTimeline';
import type { Lead } from './lead-detail/types';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (leadId: string, updates: Partial<Lead>) => void;
}

export function LeadDetailModal({ lead, isOpen, onClose, onUpdate }: LeadDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!lead) {return null;}

  const handleMarkContacted = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacted: true }),
      });

      if (response.ok) {
        onUpdate(lead.id, { contacted: true, contacted_at: new Date().toISOString() });
      }
    } catch (error) {
      logger.error('Failed to update lead:', error as Error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkConverted = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ converted: true }),
      });

      if (response.ok) {
        onUpdate(lead.id, { converted: true, converted_at: new Date().toISOString() });
      }
    } catch (error) {
      logger.error('Failed to update lead:', error as Error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{lead.name || lead.email}</DialogTitle>
          <p className="text-sm text-muted-foreground">Lead ID: {lead.id.slice(0, 8)}...</p>
        </DialogHeader>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          {!lead.contacted && (
            <Button onClick={handleMarkContacted} disabled={isUpdating}>
              Mark as Contacted
            </Button>
          )}
          {!lead.converted && (
            <Button onClick={handleMarkConverted} disabled={isUpdating} className="bg-success-dark hover:bg-success-darker">
              Mark as Converted
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-tight">
              <Mail className="h-4 w-4" />
              Send Email
            </a>
          </Button>
        </div>

        <LeadScoreCard lead={lead} />

        <div className="grid gap-comfortable lg:grid-cols-2">
          <ContactInfo lead={lead} />
          {lead.attribution && <AttributionInfo attribution={lead.attribution} />}
        </div>

        <CalculatorDetails lead={lead} />
        <StatusTimeline lead={lead} />
        <NotesSection lead={lead} />
      </DialogContent>
    </Dialog>
  );
}

// Re-export types for consumers
export type { Lead } from './lead-detail/types';
