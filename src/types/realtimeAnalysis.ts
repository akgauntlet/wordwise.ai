/**
 * @fileoverview TypeScript types for real-time analysis functionality
 * @module types/realtimeAnalysis
 * @author WordWise.ai Team
 * @created 2024-01-XX
 * 
 * Usage:
 * - Type definitions for real-time analysis results
 * - Error handling types for analysis failures
 * - Configuration and status types
 */

/**
 * Analysis options interface (compatible with Firebase Functions)
 */
export interface AnalysisOptions {
  includeGrammar: boolean;
  includeStyle: boolean;
  includeReadability: boolean;
  audienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  documentType?: 'essay' | 'creative-writing' | 'script' | 'general' | 'email' | 'academic' | 'business';
}

/**
 * Base suggestion interface
 */
interface BaseSuggestion {
  id: string;
  type: 'grammar' | 'style' | 'readability';
  severity: 'low' | 'medium' | 'high';
  startOffset: number;
  endOffset: number;
  originalText: string;
  suggestedText: string;
  explanation: string;
  category: string;
  documentSpecificCategory?: string;
  confidence: number;
}

/**
 * Grammar suggestion interface
 */
export interface GrammarSuggestion extends BaseSuggestion {
  type: 'grammar';
  grammarRule: string;
  eslExplanation?: string;
}

/**
 * Style suggestion interface
 */
export interface StyleSuggestion extends BaseSuggestion {
  type: 'style';
  styleCategory: 'clarity' | 'conciseness' | 'tone' | 'formality' | 'word-choice';
  impact: 'low' | 'medium' | 'high';
}

/**
 * Readability suggestion interface
 */
export interface ReadabilitySuggestion extends BaseSuggestion {
  type: 'readability';
  metric: 'sentence-length' | 'word-complexity' | 'paragraph-structure' | 'transitions';
  targetLevel: string;
}

/**
 * Readability metrics interface
 */
export interface ReadabilityMetrics {
  fleschScore: number;
  gradeLevel: number;
  avgSentenceLength: number;
  avgSyllablesPerWord: number;
  wordCount: number;
  sentenceCount: number;
  complexWordsPercent: number;
}

/**
 * Real-time analysis result interface
 */
export interface RealtimeAnalysisResult {
  analysisId: string;
  timestamp: Date;
  contentHash: string;
  grammarSuggestions: GrammarSuggestion[];
  styleSuggestions: StyleSuggestion[];
  readabilitySuggestions: ReadabilitySuggestion[];
  readabilityMetrics: ReadabilityMetrics;
  totalSuggestions: number;
  processingTimeMs: number;
  isLightweight: boolean;
  /** Indicates if the content was truncated for analysis */
  wasTruncated?: boolean;
  /** Original content length before truncation */
  originalLength?: number;
}

/**
 * Real-time analysis error interface
 */
export interface RealtimeAnalysisError {
  code: string;
  message: string;
  details?: string;
  retryAfter?: number;
}

/**
 * Real-time analysis status enum
 */
export type RealtimeAnalysisStatus = 
  | 'idle'
  | 'pending'
  | 'analyzing'
  | 'complete'
  | 'error'
  | 'cancelled';

/**
 * Cached analysis result with metadata
 */
export interface CachedAnalysisResult extends RealtimeAnalysisResult {
  cachedAt: number;
  expiresAt: number;
}

/**
 * Analysis request configuration
 */
export interface RealtimeAnalysisConfig {
  debounceDelay: number;
  enableCaching: boolean;
  cacheTtlHours: number;
  analysisOptions: AnalysisOptions;
}

/**
 * Analysis statistics
 */
export interface AnalysisStatistics {
  status: RealtimeAnalysisStatus;
  lastAnalyzedLength: number;
  suggestionsCount: number;
  cacheHit: boolean;
  hasError: boolean;
}

 
