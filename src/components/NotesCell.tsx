'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Business } from '@/types/business'
import { useResultsStore } from '@/stores/results-store'
import { useContactedStore } from '@/stores/contacted-store'

interface NotesCellProps {
  business: Business
  isContacted?: boolean
}

export function NotesCell({ business, isContacted = false }: NotesCellProps) {
  const [notes, setNotes] = useState(business.notes || '')
  const [isEditing, setIsEditing] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { updateBusinessNotes } = useResultsStore()
  const { updateContactedNotes } = useContactedStore()

  // Prevent re-renders from affecting the editing state
  const businessNotesRef = useRef(business.notes)
  useEffect(() => {
    businessNotesRef.current = business.notes
  }, [business.notes])

  useEffect(() => {
    // Only sync from business.notes when not actively editing
    if (!isEditing) {
      setNotes(business.notes || '')
    }
  }, [business.notes, isEditing])

  const saveNotes = useCallback(async (newNotes: string) => {
    try {
      if (isContacted) {
        await updateContactedNotes(business.placeId, newNotes)
      } else {
        updateBusinessNotes(business.placeId, newNotes)
      }
    } catch (error) {
      console.error('Error saving notes:', error)
    }
  }, [isContacted, business.placeId, updateContactedNotes, updateBusinessNotes])

  const handleNotesChange = useCallback((value: string) => {
    setNotes(value)
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(async () => {
      await saveNotes(value)
    }, 500)
  }, [saveNotes])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (isEditing) {
    return (
      <Textarea
        ref={textareaRef}
        key={`notes-${business.placeId}-editing`} // Stable key to prevent remounting
        value={notes}
        onChange={(e) => handleNotesChange(e.target.value)}
        onBlur={async () => {
          setIsEditing(false)
          // Save any pending changes when losing focus
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            await saveNotes(notes)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setIsEditing(false)
            setNotes(businessNotesRef.current || '')
          }
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            setIsEditing(false)
            // Save immediately on Ctrl+Enter
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current)
              saveNotes(notes) // Don't await here to avoid blocking the UI
            }
          }
        }}
        placeholder="Add notes..."
        className="min-h-[60px] resize-none"
        autoFocus
      />
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="min-h-[60px] p-2 border rounded cursor-pointer hover:bg-muted/50 transition-colors"
    >
      {notes ? (
        <p className="text-sm whitespace-pre-wrap">{notes}</p>
      ) : (
        <p className="text-sm text-muted-foreground">Click to add notes...</p>
      )}
    </div>
  )
}
