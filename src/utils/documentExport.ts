/**
 * @fileoverview Client-side document export utilities
 * @module utils/documentExport
 * 
 * Dependencies: Tiptap content types
 * Usage: Handles client-side export for .txt and .md formats
 */

import type { TiptapContent, ExportFileFormat } from '@/types/document';

/**
 * Convert Tiptap JSON content to plain text
 * Removes all formatting and extracts text content
 */
export function convertToPlainText(content: TiptapContent): string {
  if (!content) return '';

  let text = '';

  if (content.text) {
    text += content.text;
  }

  if (content.content) {
    for (const child of content.content) {
      const childText = convertToPlainText(child);
      
      // Add line breaks for block elements
      if (content.type === 'paragraph' || content.type === 'heading') {
        text += childText + '\n\n';
      } else if (content.type === 'listItem') {
        text += childText + '\n';
      } else {
        text += childText;
      }
    }
  }

  return text;
}

/**
 * Convert Tiptap JSON content to Markdown
 * Preserves basic formatting and structure
 */
export function convertToMarkdown(content: TiptapContent): string {
  if (!content) return '';

  let markdown = '';

  // Handle text nodes with marks
  if (content.text) {
    let text = content.text;
    
    if (content.marks) {
      for (const mark of content.marks) {
        switch (mark.type) {
          case 'bold':
            text = `**${text}**`;
            break;
          case 'italic':
            text = `*${text}*`;
            break;
          case 'code':
            text = `\`${text}\``;
            break;
          case 'strike':
            text = `~~${text}~~`;
            break;
          case 'link': {
            const href = mark.attrs?.href || '#';
            text = `[${text}](${href})`;
            break;
          }
        }
      }
    }
    
    markdown += text;
  }

  // Handle block and container elements
  if (content.content) {
    for (const child of content.content) {
      const childMarkdown = convertToMarkdown(child);
      
              switch (content.type) {
          case 'heading': {
            const level = typeof content.attrs?.level === 'number' ? content.attrs.level : 1;
            const hashes = '#'.repeat(level);
            markdown += `${hashes} ${childMarkdown}\n\n`;
            break;
          }
            
          case 'paragraph':
            markdown += `${childMarkdown}\n\n`;
            break;
            
          case 'blockquote': {
            const quotedLines = childMarkdown.split('\n').map(line => `> ${line}`).join('\n');
            markdown += `${quotedLines}\n\n`;
            break;
          }
            
          case 'bulletList':
            markdown += `${childMarkdown}\n`;
            break;
            
          case 'orderedList':
            markdown += `${childMarkdown}\n`;
            break;
            
          case 'listItem': {
            const listType = getParentListType();
            if (listType === 'orderedList') {
              markdown += `1. ${childMarkdown}\n`;
            } else {
              markdown += `- ${childMarkdown}\n`;
            }
            break;
          }
            
          case 'codeBlock': {
            const language = typeof content.attrs?.language === 'string' ? content.attrs.language : '';
            markdown += `\`\`\`${language}\n${childMarkdown}\n\`\`\`\n\n`;
            break;
          }
          
        default:
          markdown += childMarkdown;
      }
    }
  }

  return markdown;
}

/**
 * Helper function to determine parent list type
 * Note: This is simplified - in a full implementation you'd track parent context
 */
function getParentListType(): string {
  // This is a simplification - in practice you'd need to track the parent context
  // For now, default to bullet list
  return 'bulletList';
}

/**
 * Create and trigger download of a text file
 */
export function downloadTextFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export document content as .txt file
 */
export function exportAsTxt(
  content: TiptapContent, 
  title: string
): void {
  const plainText = convertToPlainText(content);
  const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
  
  downloadTextFile(plainText, filename, 'text/plain');
}

/**
 * Export document content as .md file
 */
export function exportAsMarkdown(
  content: TiptapContent, 
  title: string
): void {
  const markdown = convertToMarkdown(content);
  const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  
  downloadTextFile(markdown, filename, 'text/markdown');
}

/**
 * Generate filename for export
 */
export function generateExportFilename(title: string, format: ExportFileFormat): string {
  const cleanTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${cleanTitle}.${format}`;
}

/**
 * Get MIME type for export format
 */
export function getExportMimeType(format: ExportFileFormat): string {
  switch (format) {
    case 'txt':
      return 'text/plain';
    case 'md':
      return 'text/markdown';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
} 
