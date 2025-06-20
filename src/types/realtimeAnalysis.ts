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
  documentType?: 'essay' | 'email' | 'letter' | 'report' | 'other';
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
  enableChangeDetection: boolean;
  enableCaching: boolean;
  cacheTtlHours: number;
  analysisOptions: AnalysisOptions;
}

/**
 * Analysis statistics for debugging
 */
export interface AnalysisStatistics {
  status: RealtimeAnalysisStatus;
  lastAnalyzedLength: number;
  suggestionsCount: number;
  processingTime: number;
  cacheHit: boolean;
  hasError: boolean;
}

/**
 * Content change detection result
 */
export interface ContentChangeResult {
  hasChanges: boolean;
  changedSentences: number;
  addedSentences: number;
  removedSentences: number;
  changePercentage: number;
} 
