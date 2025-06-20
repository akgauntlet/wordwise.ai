/**
 * @fileoverview Custom Tiptap extension for rendering writing suggestions
 * @module components/editor/SuggestionExtension
 * 
 * Dependencies: Tiptap, ProseMirror decorations
 * Usage: Renders suggestion underlines as decorations with click handlers
 */

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node } from '@tiptap/pm/model';
import type { Transaction } from '@tiptap/pm/state';
import type { 
  GrammarSuggestion, 
  StyleSuggestion, 
  ReadabilitySuggestion 
} from '@/types/realtimeAnalysis';

/**
 * Union type for all suggestion types
 */
export type WritingSuggestion = GrammarSuggestion | StyleSuggestion | ReadabilitySuggestion;

/**
 * Plugin options for the suggestion extension
 */
interface SuggestionPluginOptions {
  /** Array of suggestions to render */
  suggestions: WritingSuggestion[];
  /** Callback when a suggestion is clicked */
  onSuggestionClick: (suggestion: WritingSuggestion) => void;
  /** Callback when a suggestion is accepted */
  onSuggestionAccept: (suggestion: WritingSuggestion) => void;
  /** Callback when a suggestion is rejected */
  onSuggestionReject: (suggestion: WritingSuggestion) => void;
}

/**
 * Plugin key for the suggestion plugin
 */
const suggestionPluginKey = new PluginKey('suggestions');

/**
 * Get CSS classes for suggestion type
 */
function getSuggestionClasses(type: WritingSuggestion['type']): string {
  const baseClasses = 'cursor-pointer transition-colors duration-150';
  
  switch (type) {
    case 'grammar':
      return `${baseClasses} border-b-2 border-wavy border-error-600 bg-error-50/30 hover:bg-error-50/50`;
    case 'style':
      return `${baseClasses} border-b-2 border-wavy border-warning-600 bg-warning-50/30 hover:bg-warning-50/50`;
    case 'readability':
      return `${baseClasses} border-b-2 border-wavy border-success-600 bg-success-50/30 hover:bg-success-50/50`;
    default:
      return baseClasses;
  }
}

/**
 * Find current position of suggestion text in document using ProseMirror's text handling
 * Improved to handle word boundaries and avoid substring collisions
 */
function findSuggestionPosition(doc: Node, suggestion: WritingSuggestion): { from: number; to: number } | null {
  const originalText = suggestion.originalText;
  
  if (!originalText || originalText.trim().length === 0) {
    console.warn(`Empty original text for suggestion ${suggestion.id}`);
    return null;
  }
  
  // Helper function to check if a character is a word boundary
  const isWordBoundary = (text: string, index: number): boolean => {
    if (index < 0 || index >= text.length) return true;
    const char = text[index];
    return /\s|[^\w]/.test(char);
  };

  // Helper function to find all text positions in the document with word boundary checking
  const findTextPositions = (searchText: string): Array<{ from: number; to: number }> => {
    const positions: Array<{ from: number; to: number }> = [];
    
    // Walk through the document node by node
    doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        const text = node.text;
        let searchFrom = 0;
        
        while (searchFrom < text.length) {
          const index = text.indexOf(searchText, searchFrom);
          if (index === -1) break;
          
          const absoluteFrom = pos + index;
          const absoluteTo = absoluteFrom + searchText.length;
          
          // For short words (≤3 characters), check word boundaries to avoid substring matches
          const isShortWord = searchText.length <= 3;
          const hasProperBoundaries = isShortWord ? 
            isWordBoundary(text, index - 1) && isWordBoundary(text, index + searchText.length) :
            true;
          
          if (hasProperBoundaries) {
            // Verify this position contains the exact text
            try {
              const actualText = doc.textBetween(absoluteFrom, absoluteTo);
              if (actualText === searchText) {
                positions.push({ from: absoluteFrom, to: absoluteTo });
              }
            } catch {
              // Position might be invalid, skip it
            }
          }
          
          searchFrom = index + 1;
        }
      }
      return true; // Continue traversal
    });
    
    return positions;
  };

  // Try to use exact position first if available
  if (typeof suggestion.startOffset === 'number' && typeof suggestion.endOffset === 'number') {
    const expectedLength = suggestion.endOffset - suggestion.startOffset;
    
    // Only use exact position if the length matches the original text
    if (expectedLength === originalText.length) {
      try {
        // Check if the exact position still contains our text
        const textAtPosition = doc.textBetween(suggestion.startOffset, suggestion.endOffset);
        if (textAtPosition === originalText) {
          console.log(`Using exact position for suggestion ${suggestion.id}: ${suggestion.startOffset}-${suggestion.endOffset}`);
          return { from: suggestion.startOffset, to: suggestion.endOffset };
        }
      } catch {
        // Exact position is invalid, fall back to search
        console.log(`Exact position invalid for suggestion ${suggestion.id}, falling back to search`);
      }
    }
  }
  
  // Fall back to finding all positions where the original text appears
  const positions = findTextPositions(originalText);
  
  if (positions.length === 0) {
    // Text not found - might have been edited
    console.log(`Text "${originalText}" not found in document for suggestion ${suggestion.id}`);
    return null;
  }
  
  if (positions.length === 1) {
    // Only one occurrence, use it
    console.log(`Single occurrence found for suggestion ${suggestion.id}: ${positions[0].from}-${positions[0].to}`);
    return positions[0];
  }
  
  // Multiple occurrences - find the closest to original position
  let bestMatch = positions[0];
  let minDistance = Math.abs(positions[0].from - suggestion.startOffset);
  
  for (let i = 1; i < positions.length; i++) {
    const distance = Math.abs(positions[i].from - suggestion.startOffset);
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = positions[i];
    }
  }
  
  console.log(`Found ${positions.length} occurrences of "${originalText}", using position ${bestMatch.from}-${bestMatch.to} (distance: ${minDistance})`);
  return bestMatch;
}

/**
 * Create decorations for suggestions
 */
function createSuggestionDecorations(
  doc: Node,
  suggestions: WritingSuggestion[],
  onSuggestionClick: (suggestion: WritingSuggestion) => void
): DecorationSet {
  const decorations: Decoration[] = [];

  for (const suggestion of suggestions) {
    // Validate suggestion data
    if (!suggestion.originalText || !suggestion.suggestedText || 
        typeof suggestion.startOffset !== 'number' || typeof suggestion.endOffset !== 'number') {
      console.warn(`Invalid suggestion data for ${suggestion.id}:`, suggestion);
      continue;
    }

    // Find current position of suggestion text
    const position = findSuggestionPosition(doc, suggestion);
    if (!position) {
      // Skip suggestions where original text is no longer found
      continue;
    }

    // Validate position bounds
    if (position.from < 0 || position.to > doc.content.size || position.from >= position.to) {
      console.warn(`Invalid position for suggestion ${suggestion.id}:`, position);
      continue;
    }

    // Create decoration for the suggestion range
    const decoration = Decoration.inline(
      position.from,
      position.to,
      {
        class: getSuggestionClasses(suggestion.type),
        'data-suggestion-id': suggestion.id,
        'data-suggestion-type': suggestion.type,
        'data-severity': suggestion.severity,
        title: `${suggestion.type}: ${suggestion.explanation}`,
      },
      {
        // Decoration spec with click handler
        inclusive: false,
        // Store suggestion data with the decoration and current position
        suggestion: { ...suggestion, currentFrom: position.from, currentTo: position.to },
        onSuggestionClick,
      }
    );

    decorations.push(decoration);
  }

  return DecorationSet.create(doc, decorations);
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    suggestions: {
      updateSuggestions: (suggestions: WritingSuggestion[]) => ReturnType;
      clearSuggestions: () => ReturnType;
      applySuggestion: (suggestion: WritingSuggestion) => ReturnType;
      rejectSuggestion: (suggestion: WritingSuggestion) => ReturnType;
    }
  }
}

/**
 * Custom Tiptap extension for writing suggestions
 */
export const SuggestionExtension = Extension.create<SuggestionPluginOptions>({
  name: 'suggestions',

  addOptions() {
    return {
      suggestions: [],
      onSuggestionClick: () => {},
      onSuggestionAccept: () => {},
      onSuggestionReject: () => {},
    };
  },

  addProseMirrorPlugins() {
    const { suggestions, onSuggestionClick } = this.options;

    return [
      new Plugin({
        key: suggestionPluginKey,

        state: {
          init(_, { doc }) {
            return createSuggestionDecorations(doc, suggestions, onSuggestionClick);
          },

          apply(tr: Transaction, decorationSet: DecorationSet) {
            // Check if suggestions were explicitly updated via updateSuggestions command
            const newSuggestions = tr.getMeta(suggestionPluginKey);
            if (newSuggestions !== undefined) {
              // Always use the explicitly provided suggestions
              return createSuggestionDecorations(tr.doc, newSuggestions, onSuggestionClick);
            }
            
            // Otherwise, just map existing decorations through the transaction
            return decorationSet.map(tr.mapping, tr.doc);
          },
        },

        props: {
          decorations(state) {
            return this.getState(state);
          },

          handleClick(view, pos, event) {
            // Find clicked decoration
            const decorations = this.getState(view.state);
            if (!decorations) return false;

            const clickedDecoration = decorations.find(pos, pos + 1);
            
            for (const decoration of clickedDecoration) {
              const suggestion = decoration.spec?.suggestion;
              const clickHandler = decoration.spec?.onSuggestionClick;
              if (suggestion && clickHandler) {
                event.preventDefault();
                // Pass the suggestion with potentially updated positions
                clickHandler(suggestion);
                return true;
              }
            }

            return false;
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      /**
       * Update suggestions in the editor
       */
      updateSuggestions: (suggestions: WritingSuggestion[]) => ({ tr }) => {
        tr.setMeta(suggestionPluginKey, suggestions);
        return true;
      },

      /**
       * Clear all suggestions
       */
      clearSuggestions: () => ({ tr }) => {
        tr.setMeta(suggestionPluginKey, []);
        return true;
      },

      /**
       * Apply a suggestion to the text
       */
      applySuggestion: (suggestion: WritingSuggestion) => ({ tr }) => {
        console.log(`Attempting to apply suggestion ${suggestion.id}:`, {
          originalText: suggestion.originalText,
          suggestedText: suggestion.suggestedText,
          originalPosition: `${suggestion.startOffset}-${suggestion.endOffset}`
        });

        // Find current position of the suggestion text
        const position = findSuggestionPosition(tr.doc, suggestion);
        
        if (!position) {
          // Text not found - suggestion is no longer applicable
          console.warn(`Cannot apply suggestion ${suggestion.id}: original text "${suggestion.originalText}" not found in document`);
          return false;
        }

        console.log(`Found suggestion position: ${position.from}-${position.to}`);

        // Verify the text still matches what we expect
        const currentText = tr.doc.textBetween(position.from, position.to);
        const expectedText = suggestion.originalText;
        
        if (currentText !== expectedText) {
          console.warn(`Cannot apply suggestion ${suggestion.id}: text has changed`, {
            expected: expectedText,
            actual: currentText,
            position: `${position.from}-${position.to}`,
            expectedLength: expectedText.length,
            actualLength: currentText.length
          });
          return false;
        }
        
        console.log(`Applying suggestion: replacing "${currentText}" with "${suggestion.suggestedText}"`);
        
        // Replace the text with the suggested text
        tr.replaceWith(
          position.from,
          position.to,
          tr.doc.type.schema.text(suggestion.suggestedText)
        );
        
        console.log(`Successfully applied suggestion ${suggestion.id}`);
        return true;
      },

      /**
       * Reject a suggestion (remove from display)
       */
      rejectSuggestion: (suggestion: WritingSuggestion) => () => {
        console.log(`Rejecting suggestion ${suggestion.id}`);
        return true;
      },
    };
  },
}); 
