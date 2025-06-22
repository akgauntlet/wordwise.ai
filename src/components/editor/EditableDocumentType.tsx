/**
 * @fileoverview Editable document type component
 * @module components/editor/EditableDocumentType
 * 
 * Dependencies: React, UI components, Document types
 * Usage: Inline editable document type with click-to-edit dropdown functionality
 */

import { useState, useRef, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { DocumentType } from '@/types/document';

/**
 * Document type display names
 */
const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  'general': 'General Writing',
  'essay': 'Essay',
  'creative-writing': 'Creative Writing',
  'script': 'Script',
  'email': 'Email',
  'academic': 'Academic Paper',
  'business': 'Business Document',
};

/**
 * Editable document type props
 */
interface EditableDocumentTypeProps {
  /** Current document type value */
  documentType: DocumentType;
  /** Callback when document type changes */
  onDocumentTypeChange: (newType: DocumentType) => void;
  /** Whether the document type is read-only */
  readOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Editable document type component
 * Allows inline editing of document type with click-to-edit dropdown functionality
 * 
 * @param documentType Current document type value
 * @param onDocumentTypeChange Callback when document type changes
 * @param readOnly Whether the document type is read-only
 * @param className Additional CSS classes
 */
export function EditableDocumentType({
  documentType,
  onDocumentTypeChange,
  readOnly = false,
  className = ''
}: EditableDocumentTypeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<DocumentType>(documentType);
  const selectRef = useRef<HTMLButtonElement>(null);

  /**
   * Start editing mode
   */
  const startEditing = () => {
    if (readOnly) return;
    setIsEditing(true);
    setEditValue(documentType);
  };

  /**
   * Save the document type and exit editing mode
   */
  const saveDocumentType = (newType: DocumentType) => {
    if (newType !== documentType) {
      onDocumentTypeChange(newType);
    }
    setIsEditing(false);
  };

  /**
   * Cancel editing and revert to original document type
   */
  const cancelEditing = () => {
    setEditValue(documentType);
    setIsEditing(false);
  };

  /**
   * Handle key press events
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  /**
   * Handle selection change
   */
  const handleValueChange = (value: DocumentType) => {
    setEditValue(value);
    saveDocumentType(value);
  };

  /**
   * Focus select when entering edit mode
   */
  useEffect(() => {
    if (isEditing && selectRef.current) {
      // Trigger the select dropdown to open
      selectRef.current.click();
    }
  }, [isEditing]);

  /**
   * Update internal value when external documentType changes
   */
  useEffect(() => {
    setEditValue(documentType);
  }, [documentType]);

  // Display dropdown when editing
  if (isEditing) {
    return (
      <div className={`w-fit ${className}`}>
        <Select 
          value={editValue} 
          onValueChange={handleValueChange}
          onOpenChange={(open) => {
            if (!open) {
              setIsEditing(false);
            }
          }}
        >
          <SelectTrigger 
            ref={selectRef}
            className="h-8 text-sm border-primary/30 focus:ring-primary/20"
            onKeyDown={handleKeyPress}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Display badge when not editing
  return (
    <Badge 
      variant="secondary" 
      className={`cursor-pointer hover:bg-secondary/80 transition-colors text-xs ${readOnly ? 'cursor-default' : ''} ${className}`}
      onClick={startEditing}
      title={readOnly ? DOCUMENT_TYPE_LABELS[documentType] : `Click to change document type: ${DOCUMENT_TYPE_LABELS[documentType]}`}
    >
      {DOCUMENT_TYPE_LABELS[documentType]}
    </Badge>
  );
} 
