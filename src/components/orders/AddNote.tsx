'use client';

import React, { useState } from 'react';
import { User, Send } from 'lucide-react';

interface AddNoteProps {
  onAddNote?: (note: string) => void;
  placeholder?: string;
  title?: string;
  description?: string;
}

const AddNote: React.FC<AddNoteProps> = ({ 
  onAddNote,
  placeholder = "Add a note to this order...",
  title = "Add a note",
  description
}) => {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!note.trim()) return;

    setIsSubmitting(true);
    
    try {
      if (onAddNote) {
        await onAddNote(note.trim());
      }
      setNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-6 pb-5">
      <div className="flex flex-col items-center w-12">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-orange-400">
          <User className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
      </div>

      <div className="flex-1 pb-2 max-w-176">
        {(title || description) && (
          <div className="mb-3">
            {title && (
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                {title}
              </h4>
            )}
            {description && (
              <p className="text-xs text-gray-500">
                {description}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <div className={`
            relative rounded-2xl bg-white shadow-sm
            transition-all duration-300 ease-out
            ${isFocused 
              ? 'ring-2 ring-orange-400 ring-offset-2 shadow-lg' 
              : 'ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-md'
            }
          `}>
            <div className="flex items-center gap-4 p-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3.5 bg-transparent
                         focus:outline-none 
                         placeholder:text-gray-400 text-[15px] leading-relaxed
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200"
              />

              <button
                type="submit"
                disabled={!note.trim() || isSubmitting}
                className={`
                  relative h-11 w-11 rounded-xl shrink-0
                  flex items-center justify-center
                  transition-all duration-300 ease-out
                  focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2
                  ${!note.trim() || isSubmitting
                    ? 'bg-gray-200 cursor-not-allowed opacity-50' 
                    : 'bg-lime-400 hover:bg-lime-500 shadow-md hover:shadow-xl active:scale-95 cursor-pointer'
                  }
                `}
                aria-label="Submit note"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-5 w-5 text-white" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>

          {note.length > 0 && (
            <div className="absolute -bottom-6 right-0 text-xs text-gray-400 transition-opacity duration-200">
              {note.length} characters
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddNote;
