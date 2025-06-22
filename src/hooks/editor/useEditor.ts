/**
 * @fileoverview Custom hook for Tiptap editor initialization and management
 * @module hooks/editor/useEditor
 * 
 * Dependencies: Tiptap React, Tiptap extensions
 * Usage: Provides configured Tiptap editor instance with rich formatting capabilities
 */

import { useEditor as useTiptapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Underline } from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CharacterCount } from '@tiptap/extension-character-count';
import { IndentExtension } from '@/components/editor/IndentExtension';
import type { TiptapContent } from '@/types/document';

/**
 * Editor configuration options
 */
interface UseEditorOptions {
  /** Initial content for the editor */
  content?: TiptapContent | string;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Whether the editor is editable */
  editable?: boolean;
  /** Callback when content changes */
  onUpdate?: (content: TiptapContent, plainText: string) => void;
}

/**
 * Default placeholder text for ESL students
 */
const DEFAULT_PLACEHOLDER = "Start writing your essay here... Remember to check your grammar and word choice as you type!";

/**
 * Custom hook for Tiptap editor with rich formatting
 * 
 * @param options Editor configuration options
 * @returns Configured Tiptap editor instance
 * 
 * @example
 * ```tsx
 * const editor = useEditor({
 *   content: document.content,
 *   onUpdate: (content, plainText) => {
 *     // Handle content changes
 *   }
 * });
 * ```
 */
export function useEditor({
  content = '',
  placeholder = DEFAULT_PLACEHOLDER,
  editable = true,
  onUpdate
}: UseEditorOptions = {}) {
  const editor = useTiptapEditor({
    extensions: [
      // Core extensions
      StarterKit.configure({
        // Configure heading levels
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      
      // Custom extensions for rich formatting
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
    ],
    
    content,
    editable,
    
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        const content = editor.getJSON() as TiptapContent;
        const plainText = editor.getText();
        onUpdate(content, plainText);
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
          min-h-[400px] py-6 px-10
        `.replace(/\s+/g, ' ').trim(),
      },
    },
  });

  return editor;
}

/**
 * Hook for editor commands and utilities
 * 
 * @param editor Tiptap editor instance
 * @returns Object with common editor commands and state
 */
export function useEditorCommands(editor: ReturnType<typeof useEditor>) {
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
    setLink: (url: string) => 
      editor.chain().focus().setLink({ href: url }).run(),
    unsetLink: () => editor.chain().focus().unsetLink().run(),
    
    // History
    canUndo: editor.can().undo(),
    canRedo: editor.can().redo(),
    undo: () => editor.chain().focus().undo().run(),
    redo: () => editor.chain().focus().redo().run(),
  };
} 
