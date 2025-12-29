import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface Note {
  id: string;
  journey_id: string;
  note_type: string;
  content: string;
  related_facility_id: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface PersonalNotesProps {
  journeyId: string;
  notes: Note[];
  onUpdate: () => void;
}

const PersonalNotes: React.FC<PersonalNotesProps> = ({
  journeyId,
  notes,
  onUpdate
}) => {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<string>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('journey_notes')
        .insert({
          journey_id: journeyId,
          note_type: newNoteType,
          content: newNoteContent.trim(),
          completed: false
        });

      if (error) throw error;

      setNewNoteContent('');
      setNewNoteType('general');
      onUpdate();
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setDeletingId(noteId);
    try {
      const { error } = await supabase
        .from('journey_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleCompleted = async (note: Note) => {
    try {
      const { error } = await supabase
        .from('journey_notes')
        .update({ completed: !note.completed })
        .eq('id', note.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note');
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('journey_notes')
        .update({ content: editContent.trim() })
        .eq('id', noteId);

      if (error) throw error;

      setEditingId(null);
      setEditContent('');
      onUpdate();
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const getNoteIcon = (type: string) => {
    switch (type) {
      case 'question':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'research':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'concern':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'todo':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'question':
        return 'bg-blue-50 border-blue-200';
      case 'research':
        return 'bg-purple-50 border-purple-200';
      case 'concern':
        return 'bg-yellow-50 border-yellow-200';
      case 'todo':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-sage-50 border-sage-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Add New Note */}
      <div className="bg-white border-2 border-ocean-200 rounded-xl p-6">
        <h3 className="text-lg font-display text-ocean-800 mb-4">Add a Note</h3>

        <div className="space-y-4">
          {/* Note Type Selector */}
          <div className="flex gap-2">
            {[
              { value: 'general', label: 'General', icon: '📝' },
              { value: 'question', label: 'Question', icon: '❓' },
              { value: 'research', label: 'Research', icon: '🔍' },
              { value: 'concern', label: 'Concern', icon: '⚠️' },
              { value: 'todo', label: 'To-Do', icon: '✅' }
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setNewNoteType(type.value)}
                className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                  newNoteType === type.value
                    ? 'border-ocean-500 bg-ocean-50 text-ocean-700'
                    : 'border-sage-200 hover:border-ocean-300 text-ocean-600'
                }`}
              >
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>

          {/* Note Content */}
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Write your note here..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-sage-200 rounded-xl focus:border-ocean-500 focus:outline-none resize-none"
          />

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleAddNote}
              disabled={!newNoteContent.trim() || isSubmitting}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                newNoteContent.trim() && !isSubmitting
                  ? 'bg-ocean-600 text-white hover:bg-ocean-700'
                  : 'bg-sage-200 text-sage-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div>
        <h3 className="text-lg font-display text-ocean-800 mb-4">
          Your Notes ({notes.length})
        </h3>

        {notes.length === 0 ? (
          <div className="text-center py-12 bg-sage-50 rounded-xl">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-sage-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-ocean-600">
              No notes yet. Add your first note above!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`border-2 rounded-xl p-4 ${getNoteTypeColor(note.note_type)} ${
                    note.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 mt-1 ${
                      note.note_type === 'question' ? 'text-blue-600' :
                      note.note_type === 'research' ? 'text-purple-600' :
                      note.note_type === 'concern' ? 'text-yellow-600' :
                      note.note_type === 'todo' ? 'text-green-600' :
                      'text-ocean-600'
                    }`}>
                      {getNoteIcon(note.note_type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {editingId === note.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border-2 border-ocean-300 rounded-lg focus:border-ocean-500 focus:outline-none resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(note.id)}
                              className="px-4 py-1.5 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 text-sm font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-1.5 bg-sage-200 text-ocean-700 rounded-lg hover:bg-sage-300 text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className={`text-ocean-800 ${note.completed ? 'line-through' : ''}`}>
                            {note.content}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-ocean-500">
                            <span className="capitalize">{note.note_type}</span>
                            <span>•</span>
                            <span>{formatDate(note.created_at)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    {editingId !== note.id && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {note.note_type === 'todo' && (
                          <button
                            onClick={() => handleToggleCompleted(note)}
                            className="p-1.5 text-ocean-600 hover:bg-white rounded-lg transition-colors"
                            title={note.completed ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {note.completed ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleStartEdit(note)}
                          className="p-1.5 text-ocean-600 hover:bg-white rounded-lg transition-colors"
                          title="Edit note"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          disabled={deletingId === note.id}
                          className="p-1.5 text-red-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                          title="Delete note"
                        >
                          {deletingId === note.id ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalNotes;
