/**
 * @fileoverview Rich text editor toolbar component
 * @module components/editor/EditorToolbar
 * 
 * Dependencies: React, Tiptap editor, Shadcn UI, Lucide icons
 * Usage: Provides formatting controls for the text editor
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  Quote, 
  List, 
  ListOrdered,
  Link,
  Unlink,
  Undo,
  Redo,
  Type,
  Pilcrow
} from 'lucide-react';
import { useEditorCommands } from '@/hooks/editor';
import { EditableDocumentType } from './EditableDocumentType';
import type { Editor } from '@tiptap/react';
import type { DocumentType } from '@/types/document';

/**
 * Editor toolbar props
 */
interface EditorToolbarProps {
  /** Tiptap editor instance */
  editor: Editor | null;
  /** Current document type */
  documentType?: DocumentType;
  /** Callback when document type changes */
  onDocumentTypeChange?: (newType: DocumentType) => void;
  /** Whether document type is read-only */
  readOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
}

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
 * Link dialog component for adding/editing links
 */
function LinkDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialUrl = '',
  initialDisplayText = '' 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, displayText: string) => void;
  initialUrl?: string;
  initialDisplayText?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [displayText, setDisplayText] = useState(initialDisplayText);

  // Update state when props change
  useEffect(() => {
    setUrl(initialUrl);
    setDisplayText(initialDisplayText);
  }, [initialUrl, initialDisplayText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim(), displayText.trim());
    }
    onClose();
  };

  // Get normalized URL for preview
  const normalizedUrl = url.trim() ? normalizeUrl(url.trim()) : '';
  const showPreview = url.trim() && normalizedUrl !== url.trim();

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 mt-2 p-4 bg-background border rounded-md shadow-lg z-50 min-w-[350px]">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="link-display-text" className="text-sm font-medium">Display Text</label>
          <Input
            id="link-display-text"
            type="text"
            placeholder="Text to display for the link"
            value={displayText}
            onChange={(e) => setDisplayText(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="link-url" className="text-sm font-medium">URL</label>
          <Input
            id="link-url"
            type="text"
            placeholder="Enter any URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          {showPreview && (
            <p className="text-xs text-muted-foreground mt-1">
              Will link to: <span className="text-blue-600">{normalizedUrl}</span>
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!url.trim()}>
            Apply
          </Button>
        </div>
      </form>
    </div>
  );
}

/**
 * Toolbar section component for grouping related buttons
 */
function ToolbarSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Toolbar separator component
 */
function ToolbarSeparator() {
  return <div className="w-px h-6 bg-border mx-1" />;
}

/**
 * Rich text editor toolbar component
 * Provides comprehensive formatting controls for the Tiptap editor and document type selection
 * 
 * @param editor Tiptap editor instance
 * @param documentType Current document type
 * @param onDocumentTypeChange Callback when document type changes
 * @param readOnly Whether document type is read-only
 * @param className Additional CSS classes
 */
export function EditorToolbar({ 
  editor, 
  documentType = 'general',
  onDocumentTypeChange,
  readOnly = false,
  className = '' 
}: EditorToolbarProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const commands = useEditorCommands(editor);

  if (!editor) {
    return null;
  }

  /**
   * Handle link creation/editing
   */
  const handleLinkClick = () => {
    if (commands.isActive('link')) {
      commands.unsetLink();
    } else {
      setShowLinkDialog(true);
    }
  };

  /**
   * Handle link URL and display text submission
   */
  const handleLinkSubmit = (url: string, displayText: string) => {
    commands.setLink(url, displayText);
  };

  /**
   * Get current link URL if selection has a link
   */
  const getCurrentLink = (): string => {
    const { href } = editor.getAttributes('link');
    return href || '';
  };

  /**
   * Get selected text or current link text for display text field
   */
  const getInitialDisplayText = (): string => {
    const selectedText = commands.getSelectedText();
    if (selectedText) {
      return selectedText;
    }
    
    // If editing an existing link, get the link text
    if (commands.isActive('link')) {
      return selectedText || '';
    }
    
    return '';
  };

  return (
    <div className={`relative flex flex-wrap items-center gap-1 p-3 border-b bg-muted/30 ${className}`}>
      {/* Left side controls */}
      <div className="flex items-center gap-1 flex-1">
        {/* History Controls */}
        <ToolbarSection>
          <Button
            variant="ghost"
            size="sm"
            onClick={commands.undo}
            disabled={!commands.canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={commands.redo}
            disabled={!commands.canRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </ToolbarSection>

        <ToolbarSeparator />

        {/* Heading Selection */}
        <ToolbarSection>
          <Select
            value={
              commands.isActive('heading', { level: 1 }) ? 'h1' :
              commands.isActive('heading', { level: 2 }) ? 'h2' :
              commands.isActive('heading', { level: 3 }) ? 'h3' :
              commands.isActive('heading', { level: 4 }) ? 'h4' :
              commands.isActive('heading', { level: 5 }) ? 'h5' :
              commands.isActive('heading', { level: 6 }) ? 'h6' :
              'paragraph'
            }
            onValueChange={(value) => {
              if (value === 'paragraph') {
                editor.chain().focus().setParagraph().run();
              } else {
                const level = parseInt(value.replace('h', '')) as 1 | 2 | 3 | 4 | 5 | 6;
                commands.toggleHeading(level);
              }
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paragraph">
                <div className="flex items-center gap-2">
                  <Pilcrow className="h-4 w-4" />
                  Paragraph
                </div>
              </SelectItem>
              <SelectItem value="h1">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Heading 1
                </div>
              </SelectItem>
              <SelectItem value="h2">Heading 2</SelectItem>
              <SelectItem value="h3">Heading 3</SelectItem>
              <SelectItem value="h4">Heading 4</SelectItem>
              <SelectItem value="h5">Heading 5</SelectItem>
              <SelectItem value="h6">Heading 6</SelectItem>
            </SelectContent>
          </Select>
        </ToolbarSection>

        <ToolbarSeparator />

        {/* Text Formatting */}
        <ToolbarSection>
          <Button
            variant={commands.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={commands.toggleBold}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={commands.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={commands.toggleItalic}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={commands.isActive('underline') ? 'default' : 'ghost'}
            size="sm"
            onClick={commands.toggleUnderline}
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            variant={commands.isActive('strike') ? 'default' : 'ghost'}
            size="sm"
            onClick={commands.toggleStrike}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant={commands.isActive('code') ? 'default' : 'ghost'}
            size="sm"
            onClick={commands.toggleCode}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </Button>
        </ToolbarSection>

        <ToolbarSeparator />

        {/* Lists and Blocks */}
        <ToolbarSection>
          <Button
            variant={commands.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            onClick={commands.toggleBulletList}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={commands.isActive('orderedList') ? 'default' : 'ghost'}
            size="sm"
            onClick={commands.toggleOrderedList}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant={commands.isActive('blockquote') ? 'default' : 'ghost'}
            size="sm"
            onClick={commands.toggleBlockquote}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </ToolbarSection>

        <ToolbarSeparator />

        {/* Links */}
        <ToolbarSection>
          <Button
            variant={commands.isActive('link') ? 'default' : 'ghost'}
            size="sm"
            onClick={handleLinkClick}
            title={
              commands.isActive('link') 
                ? 'Remove Link' 
                : 'Add Link (Ctrl+Click links to open them)'
            }
          >
            {commands.isActive('link') ? (
              <Unlink className="h-4 w-4" />
            ) : (
              <Link className="h-4 w-4" />
            )}
          </Button>
        </ToolbarSection>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-1">
        <ToolbarSeparator />
        
        {/* Document Type */}
        <ToolbarSection>
          <EditableDocumentType
            documentType={documentType}
            onDocumentTypeChange={onDocumentTypeChange || (() => {})}
            readOnly={readOnly}
          />
        </ToolbarSection>
      </div>

      {/* Link Dialog */}
      <LinkDialog
        isOpen={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        onSubmit={handleLinkSubmit}
        initialUrl={getCurrentLink()}
        initialDisplayText={getInitialDisplayText()}
      />
    </div>
  );
} 
