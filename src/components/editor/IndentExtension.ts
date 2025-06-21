/**
 * @fileoverview Tiptap indent extension for tab key handling
 * @module components/editor/IndentExtension
 * 
 * Dependencies: Tiptap core
 * Usage: Provides Tab/Shift-Tab indentation for paragraphs and headings
 */

import { Extension } from '@tiptap/core';
import { Node } from 'prosemirror-model';
import { TextSelection, AllSelection, Transaction } from 'prosemirror-state';

/**
 * Indent extension options
 */
interface IndentOptions {
  /** Node types that can be indented */
  types: string[];
  /** Available indent levels */
  indentLevels: number[];
  /** Default indent level */
  defaultIndentLevel: number;
  /** Indent step in pixels */
  indentStep: number;
  /** Maximum indent level */
  maxIndentLevel: number;
}

/**
 * Indent properties and limits
 */
export enum IndentProps {
  min = 0,
  max = 240, // 8 levels * 30px each
  step = 30, // 30px per indent level
}

/**
 * Clamp a value between min and max
 */
function clamp(val: number, min: number, max: number): number {
  if (val < min) return min;
  if (val > max) return max;
  return val;
}

/**
 * Check if a node is a list node
 */
function isListNode(node: Node): boolean {
  return ['bulletList', 'orderedList', 'listItem'].includes(node.type.name);
}

/**
 * Set the indent markup for a node
 */
function setNodeIndentMarkup(tr: Transaction, pos: number, delta: number): Transaction {
  if (!tr.doc) return tr;

  const node = tr.doc.nodeAt(pos);
  if (!node) return tr;

  const minIndent = IndentProps.min;
  const maxIndent = IndentProps.max;

  const currentIndent = node.attrs.indent || 0;
  const newIndent = clamp(currentIndent + delta, minIndent, maxIndent);

  // If no change, return original transaction
  if (newIndent === currentIndent) return tr;

  const nodeAttrs = {
    ...node.attrs,
    indent: newIndent,
  };

  return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
}

/**
 * Update indent level for selected nodes
 */
function updateIndentLevel(tr: Transaction, delta: number): Transaction {
  const { doc, selection } = tr;

  if (!doc || !selection) return tr;

  if (!(selection instanceof TextSelection || selection instanceof AllSelection)) {
    return tr;
  }

  const { from, to } = selection;

  doc.nodesBetween(from, to, (node, pos) => {
    const nodeType = node.type;

    // Handle paragraphs and headings
    if (nodeType.name === 'paragraph' || nodeType.name === 'heading') {
      tr = setNodeIndentMarkup(tr, pos, delta);
      return false; // Don't recurse into this node
    }
    
    // Skip list nodes (they have their own indentation logic)
    if (isListNode(node)) {
      return false;
    }
    
    return true; // Continue recursing
  });

  return tr;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      /**
       * Increase indent level
       */
      indent: () => ReturnType;
      /**
       * Decrease indent level  
       */
      outdent: () => ReturnType;
    };
  }
}

/**
 * Tiptap indent extension
 * 
 * Provides Tab/Shift-Tab keyboard shortcuts for indenting paragraphs and headings.
 * Uses margin-left CSS property for visual indentation.
 */
export const IndentExtension = Extension.create<IndentOptions>({
  name: 'indent',

  addOptions() {
    return {
      types: ['heading', 'paragraph'],
      indentLevels: [0, 30, 60, 90, 120, 150, 180, 210, 240],
      defaultIndentLevel: 0,
      indentStep: 30,
      maxIndentLevel: 8,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: this.options.defaultIndentLevel,
            renderHTML: (attributes) => {
              if (!attributes.indent || attributes.indent === 0) {
                return {};
              }
              return {
                style: `margin-left: ${attributes.indent}px;`,
              };
            },
            parseHTML: (element) => {
              const marginLeft = element.style.marginLeft;
              if (marginLeft) {
                const value = parseInt(marginLeft, 10);
                return value || this.options.defaultIndentLevel;
              }
              return this.options.defaultIndentLevel;
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        tr = updateIndentLevel(tr, IndentProps.step);

        if (tr.docChanged) {
          dispatch?.(tr);
          return true;
        }

        return false;
      },
      
      outdent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        tr = updateIndentLevel(tr, -IndentProps.step);

        if (tr.docChanged) {
          dispatch?.(tr);
          return true;
        }

        return false;
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        const { state } = this.editor;
        const { selection } = state;
        
        // Get the current node and position
        const { $from, empty } = selection;
        const node = $from.parent;
        
        // Don't handle Tab in list items (they have their own indentation)
        if (isListNode(node)) {
          return false;
        }
        
        // Only handle Tab for paragraphs and headings
        if (!this.options.types.includes(node.type.name)) {
          return false;
        }
        
        // If there's a selection (text is selected), always indent the block
        if (!empty) {
          return this.editor.commands.indent();
        }
        
        // If cursor is at the beginning of the line or only whitespace before cursor
        const textBeforeCursor = $from.parent.textBetween(0, $from.parentOffset);
        const isAtStartOrWhitespace = textBeforeCursor.trim().length === 0;
        
        if (isAtStartOrWhitespace) {
          // Indent the entire block
          return this.editor.commands.indent();
        } else {
          // Insert a tab character at cursor position
          return this.editor.commands.insertContent('\t');
        }
      },
      
      'Shift-Tab': () => {
        const { state } = this.editor;
        const { selection } = state;
        
        // Get the current node and position
        const { $from, empty } = selection;
        const node = $from.parent;
        
        // Don't handle Shift-Tab in list items
        if (isListNode(node)) {
          return false;
        }
        
        // Only handle Shift-Tab for paragraphs and headings
        if (!this.options.types.includes(node.type.name)) {
          return false;
        }
        
        // If there's a selection (text is selected), always outdent the block
        if (!empty) {
          this.editor.commands.outdent();
          return true; // Always return true to prevent focus navigation
        }
        
        // If no selection, check if there's a tab character before the cursor
        const beforeCursor = $from.parent.textBetween(Math.max(0, $from.parentOffset - 1), $from.parentOffset);
        
        if (beforeCursor === '\t') {
          // Delete the tab character before cursor
          const tr = state.tr.delete($from.pos - 1, $from.pos);
          this.editor.view.dispatch(tr);
          return true;
        } else {
          // No tab character before cursor, try to outdent the block
          // Always return true to prevent focus navigation, even if nothing to outdent
          this.editor.commands.outdent();
          return true;
        }
      },
    };
  },
}); 
