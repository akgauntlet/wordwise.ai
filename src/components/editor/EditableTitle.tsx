/**
 * @fileoverview Editable title component for documents
 * @module components/editor/EditableTitle
 * 
 * Dependencies: React, UI components
 * Usage: Inline editable title with click-to-edit functionality
 */

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';

/**
 * Editable title props
 */
interface EditableTitleProps {
  /** Current title value */
  title: string;
  /** Callback when title changes */
  onTitleChange: (newTitle: string) => void;
  /** Whether the title is read-only */
  readOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Placeholder text for empty title */
  placeholder?: string;
  /** Maximum title length */
  maxLength?: number;
}

/**
 * Editable title component
 * Allows inline editing of document titles with click-to-edit functionality
 * 
 * @param title Current title value
 * @param onTitleChange Callback when title changes
 * @param readOnly Whether the title is read-only
 * @param className Additional CSS classes
 * @param placeholder Placeholder text for empty title
 * @param maxLength Maximum title length
 */
export function EditableTitle({
  title,
  onTitleChange,
  readOnly = false,
  className = '',
  placeholder = 'Untitled Document',
  maxLength = 150
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Start editing mode
   */
  const startEditing = () => {
    if (readOnly) return;
    setIsEditing(true);
    setEditValue(title);
  };

  /**
   * Save the title and exit editing mode
   */
  const saveTitle = () => {
    const trimmedValue = editValue.trim();
    const finalTitle = trimmedValue || placeholder;
    
    if (finalTitle !== title) {
      onTitleChange(finalTitle);
    }
    
    setIsEditing(false);
  };

  /**
   * Cancel editing and revert to original title
   */
  const cancelEditing = () => {
    setEditValue(title);
    setIsEditing(false);
  };

  /**
   * Handle key press events
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  /**
   * Handle input blur (click away)
   */
  const handleBlur = () => {
    saveTitle();
  };

  /**
   * Focus input when entering edit mode
   */
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Display title or input based on editing state
  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyPress}
        onBlur={handleBlur}
        maxLength={maxLength}
        className={`text-2xl font-bold border-none shadow-none px-1 py-0.5 -mx-1 h-auto bg-transparent focus-visible:ring-0 rounded ${className}`}
      />
    );
  }

  return (
    <h1 
      className={`text-2xl font-bold cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 -mx-1 transition-colors ${readOnly ? 'cursor-default' : ''} ${className}`}
      onClick={startEditing}
      title={readOnly ? undefined : 'Click to edit title'}
    >
      {title || placeholder}
    </h1>
  );
} 
