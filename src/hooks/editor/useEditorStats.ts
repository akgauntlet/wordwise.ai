/**
 * @fileoverview Custom hook for editor statistics and metrics
 * @module hooks/editor/useEditorStats
 * 
 * Dependencies: React, Tiptap editor
 * Usage: Provides real-time statistics for text content
 */

import { useMemo } from 'react';
import type { Editor } from '@tiptap/react';

/**
 * Editor statistics interface
 */
export interface EditorStats {
  /** Total character count (including spaces) */
  characters: number;
  /** Character count excluding spaces */
  charactersNoSpaces: number;
  /** Total word count */
  words: number;
  /** Total sentence count */
  sentences: number;
  /** Total paragraph count */
  paragraphs: number;
  /** Estimated reading time in minutes */
  readingTime: number;
  /** Average words per sentence */
  avgWordsPerSentence: number;
  /** Average characters per word */
  avgCharactersPerWord: number;
}

/**
 * Count sentences in text
 * Uses regex to identify sentence boundaries
 */
function countSentences(text: string): number {
  if (!text.trim()) return 0;
  
  // Remove extra whitespace and match sentence endings
  const sentences = text
    .trim()
    .replace(/\s+/g, ' ')
    // Match sentences ending with . ! ? followed by space/newline or end of string
    .match(/[.!?]+(?:\s|$)/g);
  
  return sentences ? sentences.length : 0;
}

/**
 * Count paragraphs in text
 * Splits on double newlines or paragraph breaks
 */
function countParagraphs(text: string): number {
  if (!text.trim()) return 0;
  
  // Split on double newlines and filter out empty strings
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter(p => p.trim().length > 0);
  
  return paragraphs.length;
}

/**
 * Calculate reading time estimate
 * Based on average reading speed of 200 words per minute
 */
function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200;
  const minutes = wordCount / wordsPerMinute;
  return Math.max(1, Math.ceil(minutes));
}

/**
 * Custom hook for editor statistics
 * 
 * @param editor Tiptap editor instance
 * @returns Real-time statistics object
 * 
 * @example
 * ```tsx
 * const stats = useEditorStats(editor);
 * console.log(`${stats.words} words, ${stats.characters} characters`);
 * ```
 */
export function useEditorStats(editor: Editor | null): EditorStats {
  // Extract the text content to avoid complex dependency
  const text = editor?.getText() || '';
  
  return useMemo(() => {
    if (!editor || !text) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0,
        avgWordsPerSentence: 0,
        avgCharactersPerWord: 0,
      };
    }

    // Get text content from editor
    const textNoSpaces = text.replace(/\s/g, '');
    
    // Basic counts
    const characters = text.length;
    const charactersNoSpaces = textNoSpaces.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);
    
    // Calculated metrics
    const readingTime = calculateReadingTime(words);
    const avgWordsPerSentence = sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0;
    const avgCharactersPerWord = words > 0 ? Math.round((charactersNoSpaces / words) * 10) / 10 : 0;

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTime,
      avgWordsPerSentence,
      avgCharactersPerWord,
    };
  }, [editor, text]);
}

/**
 * Hook for progress-based statistics
 * Useful for writing goals and progress tracking
 */
export function useEditorProgress(editor: Editor | null, targetWords: number = 500) {
  const stats = useEditorStats(editor);
  
  return useMemo(() => {
    const progress = targetWords > 0 ? Math.min((stats.words / targetWords) * 100, 100) : 0;
    const remaining = Math.max(targetWords - stats.words, 0);
    
    return {
      ...stats,
      targetWords,
      progress: Math.round(progress),
      remainingWords: remaining,
      isComplete: stats.words >= targetWords,
    };
  }, [stats, targetWords]);
} 
