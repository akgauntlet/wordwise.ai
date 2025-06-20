/**
 * @fileoverview Main document editor component
 * @module components/editor/DocumentEditor
 * 
 * Dependencies: React, Tiptap editor, Editor hooks and components
 * Usage: Complete rich text editor with toolbar and statistics
 */

import { useCallback, useMemo, memo } from 'react';
import { EditorContent } from '@tiptap/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { EditorToolbar } from './EditorToolbar';
import { EditorStats } from './EditorStats';
import { EditableTitle } from './EditableTitle';
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
  /** Callback when title changes */
  onTitleChange?: (newTitle: string) => void;
  /** Callback for auto-save */
  onAutoSave?: (content: TiptapContent, plainText: string) => Promise<void>;
  /** External save status from useDocument hook */
  saveStatus?: 'saved' | 'auto-saved' | 'saving' | 'pending' | 'error';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Memoized auto-save status display component
 */
const AutoSaveStatus = memo(({ saveStatus }: { saveStatus: string }) => {
  switch (saveStatus) {
    case 'saving':
      return (
        <div className="flex items-center gap-2 text-sm font-normal text-blue-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </div>
      );
    case 'saved':
      return (
        <div className="flex items-center gap-2 text-sm font-normal text-blue-600">
          <Save className="h-4 w-4" />
          <span>Saved</span>
        </div>
      );
    case 'auto-saved':
      return (
        <div className="flex items-center gap-2 text-sm font-normal text-blue-600">
          <Save className="h-4 w-4" />
          <span>Auto-saved</span>
        </div>
      );
    case 'error':
      return (
        <div className="flex items-center gap-2 text-sm font-normal text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>Save failed</span>
        </div>
      );
    case 'pending':
      return (
        <div className="flex items-center gap-2 text-sm font-normal text-black">
          <div className="w-3 h-3 bg-black rounded-full" />
          <span className="italic">Unsaved changes</span>
        </div>
      );
    default:
      return null;
  }
});

AutoSaveStatus.displayName = 'AutoSaveStatus';

/**
 * Memoized empty state component
 */
const EmptyState = memo(({ readOnly }: { readOnly: boolean }) => (
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
));

EmptyState.displayName = 'EmptyState';

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
 * @param saveStatus External save status from useDocument hook
 * @param className Additional CSS classes
 */
export const DocumentEditor = memo(function DocumentEditor({
  initialContent = '',
  title = 'Untitled Document',
  targetWords = 500,
  showDetailedStats = false,
  readOnly = false,
  onContentChange,
  onTitleChange,
  onAutoSave,
  saveStatus = 'saved',
  className = ''
}: DocumentEditorProps) {
  /**
   * Handle content updates from the editor - memoized to prevent re-creation
   */
  const handleContentUpdate = useCallback((content: TiptapContent, plainText: string) => {
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
   * Manual save function - memoized to prevent re-creation
   */
  const handleManualSave = useCallback(async () => {
    if (!editor || !onAutoSave) return;
    
    try {
      const content = editor.getJSON() as TiptapContent;
      const plainText = editor.getText();
      await onAutoSave(content, plainText);
    } catch (error) {
      console.error('Manual save failed:', error);
    }
  }, [editor, onAutoSave]);

  /**
   * Memoized editor content container classes
   */
  const editorContentClasses = useMemo(() => `
    relative min-h-[500px] max-h-[calc(100vh-300px)] overflow-y-auto
    ${readOnly ? 'bg-muted/20' : 'bg-background'}
  `, [readOnly]);

  /**
   * Memoized save button props
   */
  const saveButtonProps = useMemo(() => ({
    variant: "outline" as const,
    size: "sm" as const,
    onClick: handleManualSave,
    disabled: saveStatus === 'saving'
  }), [handleManualSave, saveStatus]);

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
        <div className="flex-1 max-w-[60%] min-w-0">
          <EditableTitle
            title={title}
            onTitleChange={onTitleChange || (() => {})}
            readOnly={readOnly}
            className="truncate"
          />
          <EditorStats 
            editor={editor} 
            targetWords={targetWords}
            className="mt-1" 
          />
        </div>
        
        <div className="flex items-center gap-4 flex-shrink-0">
          <AutoSaveStatus saveStatus={saveStatus} />
          {onAutoSave && (
            <Button {...saveButtonProps}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
        </div>
      </div>

      {/* Error alert */}
      {saveStatus === 'error' && (
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
        <div className={editorContentClasses}>
          <EditorContent 
            editor={editor}
            className="focus-within:outline-none"
          />
          
          {/* Empty state */}
          {editor.isEmpty && <EmptyState readOnly={readOnly} />}
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
}); 
