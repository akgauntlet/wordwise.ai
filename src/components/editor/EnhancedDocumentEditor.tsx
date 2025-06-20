/**
 * @fileoverview Enhanced document editor with integrated suggestion system
 * @module components/editor/EnhancedDocumentEditor
 * 
 * Dependencies: React, Tiptap editor, Suggestion system, Editor hooks and components
 * Usage: Complete rich text editor with real-time suggestions, sidebar, and popovers
 */

import { useCallback, useMemo, memo, useState } from 'react';
import { EditorContent } from '@tiptap/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { EditorToolbar } from './EditorToolbar';
import { EditorStats } from './EditorStats';
import { EditableTitle } from './EditableTitle';
import { SuggestionSidebar } from './SuggestionSidebar';
import { SuggestionPopover } from './SuggestionPopover';
import { RealtimeAnalysisStatus } from './RealtimeAnalysisStatus';
import { useEditorWithSuggestions } from '@/hooks/editor';
import { calculateSmartPopoverPosition } from '@/utils/popoverPositioning';
import type { TiptapContent } from '@/types/document';
import type { WritingSuggestion } from './SuggestionExtension';

/**
 * Enhanced document editor props
 */
interface EnhancedDocumentEditorProps {
  /** Initial document content */
  initialContent?: TiptapContent | string;
  /** Document title */
  title?: string;
  /** Target word count for progress tracking */
  targetWords?: number;
  /** Whether to show the suggestion sidebar */
  showSuggestionSidebar?: boolean;
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
 * Auto-save status component
 */
function AutoSaveStatus({ saveStatus }: { saveStatus: 'saved' | 'auto-saved' | 'saving' | 'pending' | 'error' }) {
  const statusConfig = {
    saved: { text: 'Saved', color: 'text-blue-600', icon: null },
    'auto-saved': { text: 'Auto-saved', color: 'text-blue-600', icon: null },
    saving: { text: 'Saving...', color: 'text-blue-400', icon: <Loader2 className="h-4 w-4 animate-spin" /> },
    pending: { text: 'Unsaved changes', color: 'text-black', icon: null },
    error: { text: 'Save failed', color: 'text-red-600', icon: <AlertCircle className="h-4 w-4" /> }
  };

  const config = statusConfig[saveStatus];

  return (
    <div className={`flex items-center gap-2 text-sm font-normal ${config.color}`}>
      {config.icon}
      <span className={saveStatus === 'pending' ? 'italic' : ''}>{config.text}</span>
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState({ readOnly }: { readOnly: boolean }) {
  if (readOnly) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>This document is empty.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-8 text-muted-foreground">
      <p className="mb-2">Start writing your essay here...</p>
      <p className="text-sm">
        Your writing will be analyzed for grammar, style, and readability as you type!
      </p>
    </div>
  );
}

/**
 * Enhanced document editor component
 * 
 * Combines Tiptap editor with real-time suggestion analysis, sidebar display,
 * click-based popovers, and comprehensive suggestion management.
 */
export const EnhancedDocumentEditor = memo(function EnhancedDocumentEditor({
  initialContent = '',
  title = 'Untitled Document',
  targetWords = 500,
  showSuggestionSidebar = true,
  readOnly = false,
  onContentChange,
  onTitleChange,
  onAutoSave,
  saveStatus = 'saved',
  className = ''
}: EnhancedDocumentEditorProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<WritingSuggestion | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  /**
   * Handle content updates from the editor - memoized to prevent re-creation
   */
  const handleContentUpdate = useCallback((content: TiptapContent, plainText: string) => {
    onContentChange?.(content, plainText);
  }, [onContentChange]);

  /**
   * Handle suggestion click - show popover at click position with smart positioning
   */
  const handleSuggestionClick = useCallback((suggestion: WritingSuggestion) => {
    // Get mouse position for popover placement
    const event = window.event as MouseEvent;
    if (event) {
      // Use smart positioning to prevent screen edge overlap
      const smartPosition = calculateSmartPopoverPosition(
        event.clientX,
        event.clientY,
        320, // Popover width (w-80)
        400, // Estimated popover height
        16   // Margin from screen edges
      );
      setPopoverPosition(smartPosition);
    }
    setSelectedSuggestion(suggestion);
  }, []);

  /**
   * Initialize the enhanced editor with suggestion integration
   */
  const {
    editor,
    suggestions,
    analysisStatus,
    acceptSuggestion,
    rejectSuggestion,
    acceptAllSuggestionsOfType,
    rejectAllSuggestionsOfType
  } = useEditorWithSuggestions({
    content: initialContent,
    editable: !readOnly,
    onUpdate: handleContentUpdate,
    onSuggestionClick: handleSuggestionClick,
    enableRealtimeAnalysis: !readOnly,
    placeholder: readOnly 
      ? 'This document is read-only.'
      : 'Start writing your essay here... Your writing will be analyzed for grammar, style, and readability as you type!'
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
   * Handle popover close
   */
  const handlePopoverClose = useCallback(() => {
    setSelectedSuggestion(null);
  }, []);

  /**
   * Handle suggestion acceptance from popover
   */
  const handlePopoverAccept = useCallback((suggestion: WritingSuggestion) => {
    acceptSuggestion(suggestion);
    setSelectedSuggestion(null);
  }, [acceptSuggestion]);

  /**
   * Handle suggestion rejection from popover
   */
  const handlePopoverReject = useCallback((suggestion: WritingSuggestion) => {
    rejectSuggestion(suggestion);
    setSelectedSuggestion(null);
  }, [rejectSuggestion]);

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
    <>
      {/* Main Editor Area */}
      <div className={`h-full space-y-4 ${showSuggestionSidebar && !readOnly ? 'pr-80' : ''} ${className}`}>
        {/* Header with title and auto-save status */}
        <div className="space-y-2">
          {/* Title row with save status and button */}
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-[60%] min-w-0">
              <EditableTitle
                title={title}
                onTitleChange={onTitleChange || (() => {})}
                readOnly={readOnly}
                className="truncate"
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
          
          {/* Stats row */}
          <div className="flex items-center">
            <div className="flex-1">
              <EditorStats 
                editor={editor} 
                targetWords={targetWords}
                className="text-sm" 
              />
            </div>
            <div className="flex-1 flex justify-center">
              {!readOnly && (
                <RealtimeAnalysisStatus 
                  status={analysisStatus}
                  suggestionsCount={suggestions.length}
                />
              )}
            </div>
            <div className="flex-1"></div>
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
      </div>

      {/* Suggestion Sidebar - Fixed positioned */}
      {showSuggestionSidebar && !readOnly && (
        <SuggestionSidebar
          suggestions={suggestions}
          isAnalyzing={analysisStatus === 'analyzing'}
          onAcceptSuggestion={acceptSuggestion}
          onRejectSuggestion={rejectSuggestion}
          onAcceptAllType={acceptAllSuggestionsOfType}
          onRejectAllType={rejectAllSuggestionsOfType}
        />
      )}

      {/* Suggestion Popover */}
      <SuggestionPopover
        suggestion={selectedSuggestion}
        isVisible={!!selectedSuggestion}
        position={popoverPosition}
        onAccept={handlePopoverAccept}
        onReject={handlePopoverReject}
        onClose={handlePopoverClose}
      />
    </>
  );
}); 
