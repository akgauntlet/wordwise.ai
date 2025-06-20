/**
 * @fileoverview Type definitions for AI analysis functionality
 * @module types/ai
 * @author WordWise.ai Team
 * @created 2024-01-XX
 * 
 * Dependencies:
 * - Firebase Functions for request/response types
 * - OpenAI SDK for API response types
 * 
 * Usage:
 * - Used by AI analysis functions
 * - Shared between client and server code
 * - Ensures type safety for AI operations
 */

/**
 * Configuration options for AI text analysis
 */
export interface AnalysisOptions {
  /** Whether to include grammar analysis in the results */
  includeGrammar: boolean;
  /** Whether to include style suggestions in the results */
  includeStyle: boolean;
  /** Whether to include readability analysis in the results */
  includeReadability: boolean;
  /** Target audience level for analysis (beginner, intermediate, advanced) */
  audienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  /** Document type context for better analysis */
  documentType?: 'essay' | 'email' | 'letter' | 'report' | 'other';
}

/**
 * Request payload for text analysis function
 */
export interface AnalyzeTextRequest {
  /** Text content to analyze (max 10,000 characters) */
  content: string;
  /** Analysis configuration options */
  options: AnalysisOptions;
  /** User ID for rate limiting and personalization */
  userId: string;
  /** Optional document ID for caching */
  documentId?: string;
}

/**
 * Base interface for all suggestion types
 */
export interface BaseSuggestion {
  /** Unique identifier for the suggestion */
  id: string;
  /** Type of suggestion */
  type: 'grammar' | 'style' | 'readability';
  /** Severity level of the issue */
  severity: 'low' | 'medium' | 'high';
  /** Starting character position in the text */
  startOffset: number;
  /** Ending character position in the text */
  endOffset: number;
  /** Original text that has the issue */
  originalText: string;
  /** Suggested replacement text */
  suggestedText: string;
  /** Human-readable explanation of the issue */
  explanation: string;
  /** Category of the suggestion (e.g., "subject-verb agreement") */
  category: string;
  /** Confidence score from AI analysis (0-1) */
  confidence: number;
}

/**
 * Grammar-specific suggestion with additional context
 */
export interface GrammarSuggestion extends BaseSuggestion {
  type: 'grammar';
  /** Grammar rule that was violated */
  grammarRule: string;
  /** Educational explanation for ESL learners */
  eslExplanation?: string;
}

/**
 * Style-specific suggestion for writing improvement
 */
export interface StyleSuggestion extends BaseSuggestion {
  type: 'style';
  /** Style category (clarity, conciseness, tone, etc.) */
  styleCategory: 'clarity' | 'conciseness' | 'tone' | 'formality' | 'word-choice';
  /** Impact of applying this suggestion */
  impact: 'low' | 'medium' | 'high';
}

/**
 * Readability metrics and suggestions
 */
export interface ReadabilitySuggestion extends BaseSuggestion {
  type: 'readability';
  /** Specific readability metric affected */
  metric: 'sentence-length' | 'word-complexity' | 'paragraph-structure' | 'transitions';
  /** Target reading level */
  targetLevel: string;
}

/**
 * Overall readability metrics for the document
 */
export interface ReadabilityMetrics {
  /** Flesch Reading Ease score (0-100) */
  fleschScore: number;
  /** Grade level equivalent */
  gradeLevel: number;
  /** Average sentence length */
  avgSentenceLength: number;
  /** Average syllables per word */
  avgSyllablesPerWord: number;
  /** Total word count */
  wordCount: number;
  /** Total sentence count */
  sentenceCount: number;
  /** Percentage of complex words */
  complexWordsPercent: number;
}

/**
 * Complete analysis result from AI processing
 */
export interface AIAnalysisResult {
  /** Unique identifier for this analysis */
  analysisId: string;
  /** Timestamp when analysis was performed */
  timestamp: Date;
  /** Hash of the analyzed content for caching */
  contentHash: string;
  /** Grammar suggestions found in the text */
  grammarSuggestions: GrammarSuggestion[];
  /** Style suggestions for improvement */
  styleSuggestions: StyleSuggestion[];
  /** Readability suggestions and metrics */
  readabilitySuggestions: ReadabilitySuggestion[];
  /** Overall readability metrics */
  readabilityMetrics: ReadabilityMetrics;
  /** Total number of suggestions across all categories */
  totalSuggestions: number;
  /** Analysis options used for this analysis */
  options: AnalysisOptions;
  /** Processing time in milliseconds */
  processingTimeMs: number;
}

/**
 * Error types for AI analysis operations
 */
export interface AIAnalysisError {
  /** Error code for categorization */
  code: 'RATE_LIMIT_EXCEEDED' | 'CONTENT_TOO_LONG' | 'INVALID_CONTENT' | 'API_ERROR' | 'UNKNOWN_ERROR' | 'CONNECTION_ERROR' | 'TIMEOUT_ERROR';
  /** Human-readable error message */
  message: string;
  /** Detailed error information */
  details?: string;
  /** Retry information if applicable */
  retryAfter?: number;
}

/**
 * Response from the analyzeText function
 */
export interface AnalyzeTextResponse {
  /** Success status of the operation */
  success: boolean;
  /** Analysis results if successful */
  data?: AIAnalysisResult;
  /** Error information if failed */
  error?: AIAnalysisError;
  /** Request ID for tracking */
  requestId: string;
} 
