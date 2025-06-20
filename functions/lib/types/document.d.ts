/**
 * @fileoverview Shared document types for Firebase Functions
 * @module functions/types/document
 *
 * Dependencies: None
 * Usage: Shared type definitions for document-related functions
 */
/**
 * Tiptap content type for document structure
 */
export interface TiptapContent {
    type: string;
    content?: TiptapContent[];
    attrs?: Record<string, unknown>;
    text?: string;
    marks?: Array<{
        type: string;
        attrs?: Record<string, unknown>;
    }>;
}
/**
 * Document parse result interface
 */
export interface ParseResult {
    title: string;
    content: TiptapContent;
    plainText: string;
    wordCount: number;
    characterCount: number;
    originalFileName: string;
    fileSize: number;
    parsedAt: string;
}
//# sourceMappingURL=document.d.ts.map