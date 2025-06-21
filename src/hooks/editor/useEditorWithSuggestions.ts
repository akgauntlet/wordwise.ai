/**
 * @fileoverview Enhanced editor hook with suggestion integration
 * @module hooks/editor/useEditorWithSuggestions
 * 
 * Dependencies: Tiptap React, Suggestion extension, Real-time analysis
 * Usage: Provides configured Tiptap editor with integrated suggestion handling
 */

import { useCallback, useEffect, useState } from 'react';
import { useEditor as useTiptapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Underline } from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CharacterCount } from '@tiptap/extension-character-count';
import { SuggestionExtension, type WritingSuggestion } from '@/components/editor/SuggestionExtension';
import { IndentExtension } from '@/components/editor/IndentExtension';
import { useRealtimeAnalysis } from './useRealtimeAnalysis';
import type { TiptapContent } from '@/types/document';

/**
 * Enhanced editor configuration options
 */
interface UseEditorWithSuggestionsOptions {
  /** Initial content for the editor */
  content?: TiptapContent | string;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Whether the editor is editable */
  editable?: boolean;
  /** Callback when content changes */
  onUpdate?: (content: TiptapContent, plainText: string) => void;
  /** Callback when suggestion is clicked */
  onSuggestionClick?: (suggestion: WritingSuggestion) => void;
  /** Whether to enable real-time analysis */
  enableRealtimeAnalysis?: boolean;
}

/**
 * Hook return type
 */
interface UseEditorWithSuggestionsReturn {
  /** Tiptap editor instance */
  editor: ReturnType<typeof useTiptapEditor>;
  /** Current suggestions */
  suggestions: WritingSuggestion[];
  /** Analysis status */
  analysisStatus: 'idle' | 'analyzing' | 'complete' | 'error';
  /** Accept a suggestion */
  acceptSuggestion: (suggestion: WritingSuggestion) => void;
  /** Reject a suggestion */
  rejectSuggestion: (suggestion: WritingSuggestion) => void;
  /** Accept all suggestions of a type */
  acceptAllSuggestionsOfType: (type: WritingSuggestion['type']) => void;
  /** Reject all suggestions of a type */
  rejectAllSuggestionsOfType: (type: WritingSuggestion['type']) => void;
  /** Clear all suggestions */
  clearAllSuggestions: () => void;
  /** Manually trigger analysis */
  analyzeContent: () => void;
}

/**
 * Default placeholder text for ESL students
 */
const DEFAULT_PLACEHOLDER = "Start writing your essay here... Your writing will be analyzed for grammar, style, and readability as you type!";

/**
 * Enhanced editor hook with suggestion integration
 * 
 * @param options Editor configuration options
 * @returns Enhanced editor instance with suggestion handling
 */
export function useEditorWithSuggestions({
  content = '',
  placeholder = DEFAULT_PLACEHOLDER,
  editable = true,
  onUpdate,
  onSuggestionClick,
  enableRealtimeAnalysis = true
}: UseEditorWithSuggestionsOptions = {}): UseEditorWithSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<WritingSuggestion | null>(null);

  /**
   * Real-time analysis integration
   */
  const {
    analyzeText,
    isAnalyzing,
    result: analysisResult
  } = useRealtimeAnalysis({
    analysisOptions: {
      includeGrammar: true,
      includeStyle: true,
      includeReadability: true,
      audienceLevel: 'intermediate',
      documentType: 'essay'
    }
  });

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = useCallback((suggestion: WritingSuggestion) => {
    setSelectedSuggestion(suggestion);
    onSuggestionClick?.(suggestion);
  }, [onSuggestionClick]);

  /**
   * Initialize the editor with suggestion extension
   */
  const editor = useTiptapEditor({
    extensions: [
      // Core extensions
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      
      // Rich formatting extensions
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800 cursor-pointer',
        },
      }),
      
      Underline,
      
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      
      CharacterCount,
      
      // Indent extension for Tab key handling
      IndentExtension.configure({
        types: ['heading', 'paragraph'],
        defaultIndentLevel: 0,
        indentStep: 30,
        maxIndentLevel: 8,
      }),
      
      // Suggestion extension
      SuggestionExtension.configure({
        suggestions,
        onSuggestionClick: handleSuggestionClick,
        onSuggestionAccept: () => {
          // This will be handled by acceptSuggestion method
        },
        onSuggestionReject: () => {
          // This will be handled by rejectSuggestion method
        },
      }),
    ],
    
    content,
    editable,
    
    onUpdate: ({ editor }) => {
      const content = editor.getJSON() as TiptapContent;
      const plainText = editor.getText();
      
      // Call the provided onUpdate callback
      onUpdate?.(content, plainText);
      
      // Trigger real-time analysis if enabled
      if (enableRealtimeAnalysis && plainText.trim().length > 0) {
        analyzeText(plainText);
      }
    },
    
    editorProps: {
      attributes: {
        class: `
          prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none max-w-none
          prose-headings:font-bold prose-headings:text-foreground
          prose-p:text-foreground prose-p:leading-relaxed
          prose-strong:text-foreground prose-strong:font-semibold
          prose-em:text-foreground prose-em:italic
          prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded
          prose-blockquote:text-muted-foreground prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4
          prose-ul:text-foreground prose-ol:text-foreground
          prose-li:text-foreground prose-li:marker:text-muted-foreground
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-800
          min-h-[400px] py-4 px-6
        `.replace(/\s+/g, ' ').trim(),
      },
    },
  });

  /**
   * Clean up invalid suggestions that no longer match the document
   */
  const cleanupInvalidSuggestions = useCallback(() => {
    if (!editor) return;
    
    const docText = editor.getText();
    const validSuggestions = suggestions.filter(suggestion => {
      // Check if suggestion text still exists in the document
      return docText.includes(suggestion.originalText);
    });
    
    if (validSuggestions.length !== suggestions.length) {
      setSuggestions(validSuggestions);
      editor.commands.updateSuggestions(validSuggestions);
      // Cleaned up invalid suggestions
    }
  }, [editor, suggestions]);

  /**
   * Update suggestions when analysis result changes
   */
  useEffect(() => {
    if (analysisResult) {
      const allSuggestions: WritingSuggestion[] = [
        ...analysisResult.grammarSuggestions,
        ...analysisResult.styleSuggestions,
        ...analysisResult.readabilitySuggestions
      ];
      
      setSuggestions(allSuggestions);
      
      // Update the editor's suggestion extension
      if (editor) {
        editor.commands.updateSuggestions(allSuggestions);
      }
    }
  }, [analysisResult, editor]);

  /**
   * Sync hook suggestions state to editor extension
   */
  useEffect(() => {
    if (editor && suggestions) {
      editor.commands.updateSuggestions(suggestions);
    }
  }, [editor, suggestions]);

  /**
   * Periodically clean up invalid suggestions
   */
  useEffect(() => {
    if (!editor || suggestions.length === 0) return;
    
    const cleanup = () => cleanupInvalidSuggestions();
    const interval = setInterval(cleanup, 5000); // Clean up every 5 seconds
    
    return () => clearInterval(interval);
  }, [editor, suggestions, cleanupInvalidSuggestions]);

  /**
   * Accept a suggestion
   */
  const acceptSuggestion = useCallback((suggestion: WritingSuggestion) => {
    if (!editor) return;
    
    // Apply the suggestion using the editor command
    const success = editor.commands.applySuggestion(suggestion);
    
    if (success) {
      // Update local suggestions state only if the application was successful
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      
      // Clear selected suggestion if it was the accepted one
      if (selectedSuggestion?.id === suggestion.id) {
        setSelectedSuggestion(null);
      }
      
      // TODO: Track acceptance in Firebase for analytics
      // Suggestion accepted
    } else {
      console.warn('Failed to apply suggestion:', suggestion.id);
    }
  }, [editor, selectedSuggestion]);

  /**
   * Reject a suggestion
   */
  const rejectSuggestion = useCallback((suggestion: WritingSuggestion) => {
    if (!editor) return;
    
    // Remove the suggestion using the editor command
    const success = editor.commands.rejectSuggestion(suggestion);
    
    if (success) {
      // Update local suggestions state only if the rejection was successful
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      
      // Clear selected suggestion if it was the rejected one
      if (selectedSuggestion?.id === suggestion.id) {
        setSelectedSuggestion(null);
      }
      
      // TODO: Track rejection in Firebase for analytics
      // Suggestion rejected
    } else {
      console.warn('Failed to reject suggestion:', suggestion.id);
    }
  }, [editor, selectedSuggestion]);

  /**
   * Accept all suggestions of a specific type
   */
  const acceptAllSuggestionsOfType = useCallback((type: WritingSuggestion['type']) => {
    if (!editor) return;
    
    const suggestionsOfType = suggestions.filter(s => s.type === type);
    let successCount = 0;
    
    // Apply all suggestions of this type
    suggestionsOfType.forEach(suggestion => {
      const success = editor.commands.applySuggestion(suggestion);
      if (success) {
        successCount++;
      }
    });
    
    if (successCount > 0) {
      // Update local suggestions state
      setSuggestions(prev => prev.filter(s => s.type !== type));
      
      // Clear selected suggestion if it was of this type
      if (selectedSuggestion?.type === type) {
        setSelectedSuggestion(null);
      }
      
      // TODO: Track bulk acceptance in Firebase for analytics
      // Bulk suggestions accepted
    }
  }, [editor, suggestions, selectedSuggestion]);

  /**
   * Reject all suggestions of a specific type
   */
  const rejectAllSuggestionsOfType = useCallback((type: WritingSuggestion['type']) => {
    if (!editor) return;
    
    const suggestionsOfType = suggestions.filter(s => s.type === type);
    let successCount = 0;
    
    // Remove all suggestions of this type
    suggestionsOfType.forEach(suggestion => {
      const success = editor.commands.rejectSuggestion(suggestion);
      if (success) {
        successCount++;
      }
    });
    
    if (successCount > 0) {
      // Update local suggestions state
      setSuggestions(prev => prev.filter(s => s.type !== type));
      
      // Clear selected suggestion if it was of this type
      if (selectedSuggestion?.type === type) {
        setSelectedSuggestion(null);
      }
      
      // TODO: Track bulk rejection in Firebase for analytics
      // Bulk suggestions rejected
    }
  }, [editor, suggestions, selectedSuggestion]);

  /**
   * Clear all suggestions
   */
  const clearAllSuggestions = useCallback(() => {
    if (!editor) return;
    
    editor.commands.clearSuggestions();
    setSuggestions([]);
    setSelectedSuggestion(null);
  }, [editor]);

  /**
   * Manually trigger content analysis
   */
  const analyzeContent = useCallback(() => {
    if (!editor) return;
    
    const plainText = editor.getText();
    if (plainText.trim().length > 0) {
      analyzeText(plainText);
    }
  }, [editor, analyzeText]);

  /**
   * Determine analysis status
   */
  const analysisStatus = isAnalyzing ? 'analyzing' : 
                        analysisResult ? 'complete' : 'idle';

  return {
    editor,
    suggestions,
    analysisStatus,
    acceptSuggestion,
    rejectSuggestion,
    acceptAllSuggestionsOfType,
    rejectAllSuggestionsOfType,
    clearAllSuggestions,
    analyzeContent
  };
} 
