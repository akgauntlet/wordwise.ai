/**
 * @fileoverview Editor commands and utilities for Tiptap editor instances
 * @module hooks/editor/useEditorCommands
 * 
 * Dependencies: Tiptap React
 * Usage: Provides command utilities for any Tiptap editor instance
 */

import type { Editor } from '@tiptap/react';

/**
 * Normalize URL to ensure it has a proper protocol
 * 
 * @param url Input URL string
 * @returns Normalized URL with protocol
 */
function normalizeUrl(url: string): string {
  const trimmedUrl = url.trim();
  
  // If already has protocol, return as is
  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }
  
  // If starts with //, add https:
  if (/^\/\//.test(trimmedUrl)) {
    return `https:${trimmedUrl}`;
  }
  
  // For email addresses, use mailto:
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUrl)) {
    return `mailto:${trimmedUrl}`;
  }
  
  // For everything else, assume https://
  return `https://${trimmedUrl}`;
}

/**
 * Hook for editor commands and utilities
 * 
 * @param editor Tiptap editor instance
 * @returns Object with common editor commands and state
 */
export function useEditorCommands(editor: Editor | null) {
  if (!editor) {
    return {
      isActive: () => false,
      toggleBold: () => {},
      toggleItalic: () => {},
      toggleUnderline: () => {},
      toggleStrike: () => {},
      toggleCode: () => {},
      toggleHeading: () => {},
      toggleBulletList: () => {},
      toggleOrderedList: () => {},
      toggleBlockquote: () => {},
      setLink: () => {},
      unsetLink: () => {},
      getSelectedText: () => '',
      canUndo: false,
      canRedo: false,
      undo: () => {},
      redo: () => {},
    };
  }

  return {
    // State checkers
    isActive: (name: string, attributes?: Record<string, unknown>) => 
      editor.isActive(name, attributes),
    
    // Formatting commands
    toggleBold: () => editor.chain().focus().toggleBold().run(),
    toggleItalic: () => editor.chain().focus().toggleItalic().run(),
    toggleUnderline: () => editor.chain().focus().toggleUnderline().run(),
    toggleStrike: () => editor.chain().focus().toggleStrike().run(),
    toggleCode: () => editor.chain().focus().toggleCode().run(),
    
    // Block commands
    toggleHeading: (level: 1 | 2 | 3 | 4 | 5 | 6) => 
      editor.chain().focus().toggleHeading({ level }).run(),
    toggleBulletList: () => editor.chain().focus().toggleBulletList().run(),
    toggleOrderedList: () => editor.chain().focus().toggleOrderedList().run(),
    toggleBlockquote: () => editor.chain().focus().toggleBlockquote().run(),
    toggleCodeBlock: () => editor.chain().focus().toggleCodeBlock().run(),
    
    // Link commands
    setLink: (url: string, displayText?: string) => {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, '');
      
      if (displayText && displayText.trim()) {
        if (selectedText) {
          // If there's selected text and display text is provided, replace selection with display text and link
          return editor.chain().focus().deleteSelection().insertContent({
            type: 'text',
            text: displayText,
            marks: [{ type: 'link', attrs: { href: normalizeUrl(url) } }]
          }).run();
        } else {
          // If no selection but display text is provided, insert display text with link
          return editor.chain().focus().insertContent({
            type: 'text',
            text: displayText,
            marks: [{ type: 'link', attrs: { href: normalizeUrl(url) } }]
          }).run();
        }
      } else {
        // If no display text, set link on current selection (or insert URL as text if no selection)
        if (selectedText) {
          return editor.chain().focus().setLink({ href: normalizeUrl(url) }).run();
        } else {
          return editor.chain().focus().insertContent({
            type: 'text',
            text: normalizeUrl(url),
            marks: [{ type: 'link', attrs: { href: normalizeUrl(url) } }]
          }).run();
        }
      }
    },
    unsetLink: () => editor.chain().focus().unsetLink().run(),
    
    // Text selection
    getSelectedText: () => {
      const { from, to } = editor.state.selection;
      return editor.state.doc.textBetween(from, to, '');
    },
    
    // History
    canUndo: editor.can().undo(),
    canRedo: editor.can().redo(),
    undo: () => editor.chain().focus().undo().run(),
    redo: () => editor.chain().focus().redo().run(),
  };
} 
