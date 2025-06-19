/**
 * @fileoverview Main document editor component
 * @module components/editor/DocumentEditor
 * 
 * Dependencies: React, Tiptap editor, Editor hooks and components
 * Usage: Complete rich text editor with toolbar and statistics
 */

import { useState, useCallback, useEffect } from 'react';
import { EditorContent } from '@tiptap/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { EditorToolbar } from './EditorToolbar';
import { EditorStats } from './EditorStats';
import { useEditor } from '@/hooks/editor';
import type { TiptapContent } from '@/types/document';

/**
 * Document editor props
 */
interface DocumentEditorProps {
  /** Initial document content */
  initialContent?: TiptapContent | string;
  /** Document title */
  title?: string;
  /** Target word count for progress tracking */
  targetWords?: number;
  /** Whether to show detailed statistics */
  showDetailedStats?: boolean;
  /** Whether editor is in read-only mode */
  readOnly?: boolean;
  /** Callback when content changes */
  onContentChange?: (content: TiptapContent, plainText: string) => void;
  /** Callback for auto-save */
  onAutoSave?: (content: TiptapContent, plainText: string) => Promise<void>;
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Auto-save status types
 */
type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Main document editor component
 * Combines Tiptap editor with toolbar, statistics, and auto-save functionality
 * 
 * @param initialContent Initial content for the editor
 * @param title Document title
 * @param targetWords Target word count for progress tracking
 * @param showDetailedStats Whether to show detailed statistics
 * @param readOnly Whether editor is read-only
 * @param onContentChange Callback when content changes
 * @param onAutoSave Callback for auto-save functionality
 * @param autoSaveInterval Auto-save interval in milliseconds
 * @param className Additional CSS classes
 */
export function DocumentEditor({
  initialContent = '',
  title = 'Untitled Document',
  targetWords = 500,
  showDetailedStats = false,
  readOnly = false,
  onContentChange,
  onAutoSave,
  autoSaveInterval = 30000, // 30 seconds
  className = ''
}: DocumentEditorProps) {
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * Handle content updates from the editor
   */
  const handleContentUpdate = useCallback((content: TiptapContent, plainText: string) => {
    setHasUnsavedChanges(true);
    setAutoSaveStatus('idle');
    onContentChange?.(content, plainText);
  }, [onContentChange]);

  /**
   * Initialize the editor with content and callbacks
   */
  const editor = useEditor({
    content: initialContent,
    editable: !readOnly,
    onUpdate: handleContentUpdate,
    placeholder: readOnly 
      ? 'This document is read-only.'
      : 'Start writing your essay here... Remember to check your grammar and word choice as you type!'
  });

  /**
   * Perform auto-save
   */
  const performAutoSave = useCallback(async () => {
    if (!editor || !onAutoSave || !hasUnsavedChanges || autoSaveStatus === 'saving') {
      return;
    }

    setAutoSaveStatus('saving');

    try {
      const content = editor.getJSON() as TiptapContent;
      const plainText = editor.getText();
      await onAutoSave(content, plainText);
      
      setAutoSaveStatus('saved');
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      // Reset status after showing success briefly
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
      
      // Show error briefly then reset
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 5000);
    }
  }, [editor, onAutoSave, hasUnsavedChanges, autoSaveStatus]);

  /**
   * Manual save function
   */
  const handleManualSave = useCallback(async () => {
    await performAutoSave();
  }, [performAutoSave]);

  /**
   * Set up auto-save interval
   */
  useEffect(() => {
    if (!onAutoSave || !autoSaveInterval) return;

    const interval = setInterval(() => {
      performAutoSave();
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [performAutoSave, onAutoSave, autoSaveInterval]);

  /**
   * Handle window beforeunload to warn about unsaved changes
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  /**
   * Get auto-save status display
   */
  const getAutoSaveDisplay = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Save className="h-3 w-3" />
            Saved {lastSaved?.toLocaleTimeString()}
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-3 w-3" />
            Save failed
          </div>
        );
      default:
        return hasUnsavedChanges ? (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            Unsaved changes
          </div>
        ) : null;
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading editor...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with title and auto-save status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <EditorStats 
            editor={editor} 
            targetWords={targetWords}
            className="mt-1" 
          />
        </div>
        
        <div className="flex items-center gap-4">
          {getAutoSaveDisplay()}
          {onAutoSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={autoSaveStatus === 'saving' || !hasUnsavedChanges}
            >
              {autoSaveStatus === 'saving' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          )}
        </div>
      </div>

      {/* Error alert */}
      {autoSaveStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Auto-save failed. Your changes may not be saved. Please try saving manually.
          </AlertDescription>
        </Alert>
      )}

      {/* Main editor */}
      <Card className="overflow-hidden">
        {/* Toolbar */}
        {!readOnly && <EditorToolbar editor={editor} />}
        
        {/* Editor content */}
        <div 
          className={`
            relative min-h-[500px] max-h-[calc(100vh-300px)] overflow-y-auto
            ${readOnly ? 'bg-muted/20' : 'bg-background'}
          `}
        >
          <EditorContent 
            editor={editor}
            className="focus-within:outline-none"
          />
          
          {/* Empty state */}
          {editor.isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-muted-foreground">
                <div className="text-lg mb-2">✍️</div>
                <p className="text-sm">
                  {readOnly 
                    ? 'This document is empty.' 
                    : 'Start writing your document here...'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Detailed statistics sidebar */}
      {showDetailedStats && (
        <EditorStats 
          editor={editor} 
          targetWords={targetWords}
          showDetails={true}
          className="max-w-md"
        />
      )}
    </div>
  );
} 
