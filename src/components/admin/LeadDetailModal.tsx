/**
 * Lead Detail Modal
 * Shows complete lead information with actions
 */

'use client';

import { Building2, Calendar, Download, Globe, Mail, MessageSquare, Phone, Plus, TrendingUp, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Lead {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  calculator_type: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  lead_score: number;
  lead_quality: string;
  created_at: string;
  contacted: boolean;
  converted: boolean;
  contacted_at: string | null;
  converted_at: string | null;
  conversion_value: number | null;
  attribution: {
    source: string;
    medium: string;
    campaign: string | null;
    device_type: string | null;
    browser: string | null;
    referrer: string | null;
  } | null;
}

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (leadId: string, updates: Partial<Lead>) => void;
}

interface Note {
  id: string;
  note_type: 'note' | 'status_change' | 'email_sent' | 'call' | 'meeting';
  content: string;
  created_by: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export function LeadDetailModal({ lead, isOpen, onClose, onUpdate }: LeadDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'note' | 'call' | 'meeting' | 'email_sent'>('note');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!lead) {return;}

    try {
      const response = await fetch(`/api/admin/leads/${lead.id}/notes`);
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  }, [lead]);

  useEffect(() => {
    if (isOpen && lead) {
      fetchNotes();
    }
  }, [isOpen, lead, fetchNotes]);



  const handleAddNote = async () => {
    if (!lead || !newNote.trim()) {return;}

    setIsAddingNote(true);
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note_type: noteType,
          content: newNote,
        }),
      });

      if (response.ok) {
        setNewNote('');
        await fetchNotes();
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setIsAddingNote(false);
    }
  };

  if (!isOpen || !lead) {return null;}

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
      console.error('Failed to update lead:', error);
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
      console.error('Failed to update lead:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const calculatorName = lead.calculator_type
    .replace('-', ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-4xl rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {lead.name || lead.email}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Lead ID: {lead.id.slice(0, 8)}...
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto p-6">
            {/* Quick Actions */}
            <div className="mb-6 flex gap-3">
              {!lead.contacted && (
                <button
                  onClick={handleMarkContacted}
                  disabled={isUpdating}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Mark as Contacted
                </button>
              )}
              {!lead.converted && (
                <button
                  onClick={handleMarkConverted}
                  disabled={isUpdating}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Mark as Converted
                </button>
              )}
              <a
                href={`mailto:${lead.email}`}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Mail className="h-4 w-4" />
                Send Email
              </a>
            </div>

            {/* Lead Score Badge */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Lead Score
                  </p>
                  <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                    {lead.lead_score}/100
                  </p>
                </div>
                <span className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  lead.lead_quality === 'hot'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : lead.lead_quality === 'warm'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {lead.lead_quality.toUpperCase()} LEAD
                </span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Contact Information
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {lead.email}
                      </p>
                    </div>
                  </div>

                  {lead.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Phone
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {lead.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {lead.company && (
                    <div className="flex items-start gap-3">
                      <Building2 className="mt-0.5 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Company
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {lead.company}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Submitted
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(lead.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attribution */}
              {lead.attribution && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Traffic Attribution
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="mt-0.5 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Source / Medium
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {lead.attribution.source} / {lead.attribution.medium}
                        </p>
                      </div>
                    </div>

                    {lead.attribution.campaign && (
                      <div className="flex items-start gap-3">
                        <Globe className="mt-0.5 h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Campaign
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {lead.attribution.campaign}
                          </p>
                        </div>
                      </div>
                    )}

                    {lead.attribution.device_type && (
                      <div className="flex items-start gap-3">
                        <Download className="mt-0.5 h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Device / Browser
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {lead.attribution.device_type} / {lead.attribution.browser}
                          </p>
                        </div>
                      </div>
                    )}

                    {lead.attribution.referrer && (
                      <div className="flex items-start gap-3">
                        <Globe className="mt-0.5 h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Referrer
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white break-all">
                            {lead.attribution.referrer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Calculator Details */}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {calculatorName} Details
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Inputs */}
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                    Calculator Inputs
                  </h4>
                  <dl className="space-y-2">
                    {Object.entries(lead.inputs).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <dt className="text-gray-500 dark:text-gray-400">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                        </dt>
                        <dd className="font-medium text-gray-900 dark:text-white">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* Results */}
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
                    Calculator Results
                  </h4>
                  <dl className="space-y-2">
                    {Object.entries(lead.results).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <dt className="text-gray-500 dark:text-gray-400">
                          {key}:
                        </dt>
                        <dd className="font-medium text-gray-900 dark:text-white">
                          {String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            {(lead.contacted || lead.converted) && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Status Timeline
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <div className="h-3 w-3 rounded-full bg-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Lead Created
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(lead.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {lead.contacted && lead.contacted_at && (
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                        <div className="h-3 w-3 rounded-full bg-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Contacted
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(lead.contacted_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {lead.converted && lead.converted_at && (
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <div className="h-3 w-3 rounded-full bg-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Converted
                          {lead.conversion_value && ` - $${lead.conversion_value.toLocaleString()}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(lead.converted_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes and Activity Timeline */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notes & Activity Timeline
                </h3>
              </div>

              {/* Add Note Form */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value as typeof noteType)}
                      className="rounded-md border-gray-300 text-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="note">Note</option>
                      <option value="call">Call</option>
                      <option value="meeting">Meeting</option>
                      <option value="email_sent">Email Sent</option>
                    </select>
                  </div>

                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this lead..."
                    rows={3}
                    className="w-full rounded-md border-gray-300 text-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />

                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || isAddingNote}
                    className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add Note
                  </button>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-3">
                {notes.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No activity yet
                  </p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="flex-shrink-0">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          note.note_type === 'status_change'
                            ? 'bg-blue-100 dark:bg-blue-900'
                            : note.note_type === 'call'
                            ? 'bg-green-100 dark:bg-green-900'
                            : note.note_type === 'meeting'
                            ? 'bg-purple-100 dark:bg-purple-900'
                            : note.note_type === 'email_sent'
                            ? 'bg-yellow-100 dark:bg-yellow-900'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {note.note_type === 'status_change' && (
                            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          )}
                          {note.note_type === 'call' && (
                            <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                          )}
                          {note.note_type === 'meeting' && (
                            <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          )}
                          {note.note_type === 'email_sent' && (
                            <Mail className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          )}
                          {note.note_type === 'note' && (
                            <MessageSquare className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                            {note.note_type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(note.created_at).toLocaleString()}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {note.content}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          by {note.created_by}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
