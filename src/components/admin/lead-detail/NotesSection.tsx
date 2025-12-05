'use client';

import { useState, useCallback, useEffect } from 'react';
import { Calendar, Mail, MessageSquare, Phone, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { logger } from '@/lib/logger';
import type { Lead, Note } from './types';

interface NotesSectionProps {
  lead: Lead;
}

type NoteType = 'note' | 'call' | 'meeting' | 'email_sent';

function getNoteIcon(type: string) {
  switch (type) {
    case 'status_change': return <TrendingUp className="h-4 w-4" />;
    case 'call': return <Phone className="h-4 w-4" />;
    case 'meeting': return <Calendar className="h-4 w-4" />;
    case 'email_sent': return <Mail className="h-4 w-4" />;
    default: return <MessageSquare className="h-4 w-4" />;
  }
}

export function NotesSection({ lead }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('note');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}/notes`);
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (error) {
      logger.error('Failed to fetch notes:', error as Error);
    }
  }, [lead.id]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAddNote = async () => {
    if (!newNote.trim()) {return;}

    setIsAddingNote(true);
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_type: noteType, content: newNote }),
      });

      if (response.ok) {
        setNewNote('');
        await fetchNotes();
      }
    } catch (error) {
      logger.error('Failed to add note:', error as Error);
    } finally {
      setIsAddingNote(false);
    }
  };

  return (
    <div className="space-y-content">
      <h3 className="text-lg font-semibold">Notes & Activity Timeline</h3>

      {/* Add Note Form */}
      <div className="rounded-lg border bg-muted card-padding-sm space-y-3">
        <Select value={noteType} onValueChange={(value) => setNoteType(value as NoteType)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="note">Note</SelectItem>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="email_sent">Email Sent</SelectItem>
          </SelectContent>
        </Select>

        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note about this lead..."
          rows={3}
        />

        <Button onClick={handleAddNote} disabled={!newNote.trim() || isAddingNote}>
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No activity yet</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="flex gap-3 rounded-lg border bg-background card-padding-sm">
              <div className="shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  {getNoteIcon(note.note_type)}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium capitalize">{note.note_type.replace('_', ' ')}</p>
                  <p className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleString()}</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{note.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">by {note.created_by}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
