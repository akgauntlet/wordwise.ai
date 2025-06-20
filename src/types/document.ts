/**
 * @fileoverview Document type definitions
 * @module types/document
 * 
 * Dependencies: Firebase Firestore, Tiptap/ProseMirror
 * Usage: Type definitions for document management, content, and version history
 */

import type { Timestamp } from "firebase/firestore";

/**
 * Tiptap/ProseMirror document content structure
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
 * Document metadata and content
 */
export interface Document {
  /** Unique document identifier */
  id: string;
  /** Document title */
  title: string;
  /** Document content in JSON format (Tiptap/ProseMirror) */
  content: TiptapContent;
  /** Plain text version of content for search and analysis */
  plainText: string;
  /** Document owner's user ID */
  userId: string;
  /** Timestamp when document was created */
  createdAt: Timestamp;
  /** Timestamp when document was last updated */
  updatedAt: Timestamp;
  /** Word count */
  wordCount: number;
  /** Character count */
  characterCount: number;
  /** Document tags for organization */
  tags: string[];
  /** Document type/category */
  type: DocumentType;
  /** Whether document is shared publicly */
  isPublic: boolean;
  /** Document language */
  language: string;
  /** Last analysis results */
  lastAnalysis?: AnalysisResult;
}

/**
 * Document types/categories
 */
export type DocumentType = 
  | "essay"
  | "creative-writing"
  | "script"
  | "general"
  | "email"
  | "academic"
  | "business";

/**
 * Document version for history tracking
 */
export interface DocumentVersion {
  /** Unique version identifier */
  id: string;
  /** Parent document ID */
  documentId: string;
  /** Version number (incremental) */
  version: number;
  /** Content snapshot */
  content: TiptapContent;
  /** Plain text snapshot */
  plainText: string;
  /** Timestamp of this version */
  createdAt: Timestamp;
  /** Change summary/description */
  changeSummary?: string;
  /** Word count at this version */
  wordCount: number;
  /** Character count at this version */
  characterCount: number;
}

/**
 * AI analysis results
 */
export interface AnalysisResult {
  /** Analysis timestamp */
  analyzedAt: Timestamp;
  /** Overall score (0-100) */
  overallScore: number;
  /** Grammar issues found */
  grammarIssues: GrammarIssue[];
  /** Spelling errors found */
  spellingErrors: SpellingError[];
  /** Style suggestions */
  styleSuggestions: StyleSuggestion[];
  /** Readability metrics */
  readability: ReadabilityMetrics;
  /** Analysis summary */
  summary: string;
}

/**
 * Grammar issue detected by AI
 */
export interface GrammarIssue {
  /** Unique issue identifier */
  id: string;
  /** Start position in text */
  start: number;
  /** End position in text */
  end: number;
  /** Original text with issue */
  original: string;
  /** Suggested correction */
  suggestion: string;
  /** Issue description */
  description: string;
  /** Issue category */
  category: GrammarCategory;
  /** Confidence level (0-1) */
  confidence: number;
  /** Educational explanation */
  explanation?: string;
}

/**
 * Grammar issue categories
 */
export type GrammarCategory = 
  | "verb-tense"
  | "subject-verb-agreement"
  | "article-usage"
  | "preposition"
  | "punctuation"
  | "sentence-structure"
  | "word-order"
  | "other";

/**
 * Spelling error detected
 */
export interface SpellingError {
  /** Unique error identifier */
  id: string;
  /** Start position in text */
  start: number;
  /** End position in text */
  end: number;
  /** Misspelled word */
  word: string;
  /** Suggested corrections */
  suggestions: string[];
  /** Confidence level (0-1) */
  confidence: number;
}

/**
 * Style suggestion for improvement
 */
export interface StyleSuggestion {
  /** Unique suggestion identifier */
  id: string;
  /** Start position in text */
  start: number;
  /** End position in text */
  end: number;
  /** Original text */
  original: string;
  /** Suggested improvement */
  suggestion: string;
  /** Reason for suggestion */
  reason: string;
  /** Suggestion category */
  category: StyleCategory;
  /** Impact level */
  impact: "low" | "medium" | "high";
}

/**
 * Style suggestion categories
 */
export type StyleCategory = 
  | "clarity"
  | "conciseness"
  | "tone"
  | "word-choice"
  | "sentence-variety"
  | "transition"
  | "redundancy"
  | "formality";

/**
 * Readability metrics
 */
export interface ReadabilityMetrics {
  /** Flesch Reading Ease score */
  fleschScore: number;
  /** Grade level estimate */
  gradeLevel: number;
  /** Average sentence length */
  avgSentenceLength: number;
  /** Average syllables per word */
  avgSyllablesPerWord: number;
  /** Complex words percentage */
  complexWordsPercent: number;
}

/**
 * Document creation/update data
 */
export interface DocumentFormData {
  /** Document title */
  title: string;
  /** Document content */
  content: TiptapContent;
  /** Document tags */
  tags: string[];
  /** Document type */
  type: DocumentType;
  /** Whether document is public */
  isPublic: boolean;
  /** Document language */
  language: string;
}

/**
 * Document filter options
 */
export interface DocumentFilter {
  /** Filter by type */
  type?: DocumentType;
  /** Filter by tags */
  tags?: string[];
  /** Filter by date range */
  dateRange?: {
    start: Date;
    end: Date;
  };
  /** Search query */
  search?: string;
  /** Sort options */
  sort?: {
    field: "createdAt" | "updatedAt" | "title" | "wordCount";
    direction: "asc" | "desc";
  };
}

/**
 * Supported import file formats
 */
export type ImportFileFormat = 'txt' | 'doc' | 'docx' | 'pdf';

/**
 * Import progress status
 */
export type ImportStatus = 'idle' | 'uploading' | 'parsing' | 'analyzing' | 'complete' | 'error';

/**
 * Import operation data
 */
export interface ImportOperation {
  /** Unique operation identifier */
  id: string;
  /** Original file name */
  fileName: string;
  /** File size in bytes */
  fileSize: number;
  /** File format */
  format: ImportFileFormat;
  /** Current status */
  status: ImportStatus;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current operation message */
  message: string;
  /** Error message if operation failed */
  error?: string;
  /** Created document ID when complete */
  documentId?: string;
  /** Timestamp when operation started */
  startedAt: Date;
  /** Timestamp when operation completed */
  completedAt?: Date;
}

/**
 * Supported export file formats
 */
export type ExportFileFormat = 'txt' | 'md' | 'docx' | 'pdf';

/**
 * Export formatting presets
 */
export type ExportPreset = 'default' | 'academic' | 'business';

/**
 * Export customization options
 */
export interface ExportOptions {
  /** Font family */
  fontFamily: string;
  /** Font size in points */
  fontSize: number;
  /** Line spacing (1.0, 1.15, 1.5, 2.0) */
  lineSpacing: number;
  /** Page margins in inches */
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

/**
 * Export preset configurations
 */
export const EXPORT_PRESETS: Record<ExportPreset, ExportOptions> = {
  default: {
    fontFamily: 'Arial',
    fontSize: 12,
    lineSpacing: 1.15,
    margins: { top: 1, bottom: 1, left: 1, right: 1 }
  },
  academic: {
    fontFamily: 'Times New Roman',
    fontSize: 12,
    lineSpacing: 2.0,
    margins: { top: 1, bottom: 1, left: 1, right: 1 }
  },
  business: {
    fontFamily: 'Calibri',
    fontSize: 11,
    lineSpacing: 1.15,
    margins: { top: 0.75, bottom: 0.75, left: 0.75, right: 0.75 }
  }
};

/**
 * Export operation status
 */
export type ExportStatus = 'idle' | 'exporting' | 'complete' | 'error';

/**
 * Export operation data
 */
export interface ExportOperation {
  /** Unique operation identifier */
  id: string;
  /** Document being exported */
  documentId: string;
  /** Export format */
  format: ExportFileFormat;
  /** Export options used */
  options: ExportOptions;
  /** Current status */
  status: ExportStatus;
  /** Progress percentage (0-100) */
  progress: number;
  /** Download URL when complete */
  downloadUrl?: string;
  /** Error message if operation failed */
  error?: string;
  /** Timestamp when operation started */
  startedAt: Date;
  /** Timestamp when operation completed */
  completedAt?: Date;
}

 
