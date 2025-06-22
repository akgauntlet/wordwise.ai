/**
 * @fileoverview Document creation dialog component
 * @module components/document/DocumentCreationDialog
 * 
 * Dependencies: React, UI components, Document types
 * Usage: Dialog for creating new documents with custom title and type
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDocuments } from '@/hooks/document/useDocuments';
import type { DocumentType } from '@/types/document';
import { FileText, Loader2 } from 'lucide-react';

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
 * Document creation dialog props
 */
interface DocumentCreationDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Function to call when dialog should close */
  onClose: () => void;
  /** Function to call when document is created successfully */
  onDocumentCreated: (documentId: string) => void;
}

/**
 * Document creation dialog component
 * 
 * Provides a form interface for users to create new documents with
 * custom title and document type selection.
 */
export function DocumentCreationDialog({
  isOpen,
  onClose,
  onDocumentCreated,
}: DocumentCreationDialogProps) {
  const { createNewDocument, saving, canCreateDocument } = useDocuments();
  
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('general');
  const [titleError, setTitleError] = useState('');

  /**
   * Reset form when dialog opens/closes
   */
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDocumentType('general');
      setTitleError('');
    }
  }, [isOpen]);

  /**
   * Validate title input
   */
  const validateTitle = (titleValue: string): boolean => {
    const trimmedTitle = titleValue.trim();
    
    if (!trimmedTitle) {
      setTitleError('Document title is required');
      return false;
    }
    
    if (trimmedTitle.length > 100) {
      setTitleError('Title must be 100 characters or less');
      return false;
    }
    
    setTitleError('');
    return true;
  };

  /**
   * Handle title input change
   */
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Clear error if user starts typing
    if (titleError && newTitle.trim()) {
      setTitleError('');
    }
  };

  /**
   * Handle form submission
   */
  const handleCreateDocument = async () => {
    if (!validateTitle(title)) {
      return;
    }

    try {
      const documentId = await createNewDocument({
        title: title.trim(),
        type: documentType,
        tags: [],
        isPublic: false,
        language: 'en',
      });

      if (documentId) {
        onDocumentCreated(documentId);
        onClose();
      }
    } catch (error) {
      console.error('Failed to create document:', error);
      // Error handling is managed by the useDocuments hook
    }
  };

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateDocument();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Document
          </DialogTitle>
          <DialogDescription>
            Choose a title and type for your new document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="document-title">
              Document Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="document-title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter document title..."
              disabled={saving}
              maxLength={100}
              autoFocus
            />
            {titleError && (
              <p className="text-sm text-destructive" role="alert">
                {titleError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {title.length}/100 characters
            </p>
          </div>

          {/* Document Type Select */}
          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type</Label>
            <Select
              value={documentType}
              onValueChange={(value) => setDocumentType(value as DocumentType)}
              disabled={saving}
            >
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Select document type" />
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateDocument}
            disabled={saving || !canCreateDocument || !title.trim()}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              'Create Document'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
