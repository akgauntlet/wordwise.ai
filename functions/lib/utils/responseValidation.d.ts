/**
 * @fileoverview Response validation and parsing utilities for AI analysis
 * @module utils/responseValidation
 * @author WordWise.ai Team
 * @created 2024-01-XX
 *
 * Dependencies:
 * - AI types for validation schemas
 * - Logging utilities for error tracking
 *
 * Usage:
 * - Validate OpenAI API responses against expected schemas
 * - Parse and sanitize AI-generated suggestions
 * - Handle malformed or incomplete responses gracefully
 * - Provide fallback mechanisms for partial data
 */
import { GrammarSuggestion, StyleSuggestion, ReadabilitySuggestion, ReadabilityMetrics, AnalysisOptions } from '../types/ai';
/**
 * Parsed response interface with metadata
 */
interface ParsedResponse {
    grammarSuggestions: GrammarSuggestion[];
    styleSuggestions: StyleSuggestion[];
    readabilitySuggestions: ReadabilitySuggestion[];
    readabilityMetrics: ReadabilityMetrics;
    parseMetadata: {
        originalLength: number;
        cleanedLength: number;
        parseAttempts: number;
        warnings: string[];
        fallbacksUsed: string[];
    };
}
/**
 * Response parsing configuration
 */
interface ParseConfig {
    /** Maximum allowed suggestions per category */
    maxSuggestionsPerCategory: number;
    /** Whether to attempt fallback parsing for malformed JSON */
    enableFallbackParsing: boolean;
    /** Whether to validate suggestion content */
    validateSuggestionContent: boolean;
    /** Minimum confidence threshold for suggestions */
    minConfidenceThreshold: number;
}
/**
 * Enhanced response parser with comprehensive error handling and validation
 *
 * @param response - Raw response from OpenAI API
 * @param config - Parsing configuration options
 * @returns Parsed and validated response data
 *
 * @throws {AIAnalysisError} When response is completely invalid
 */
export declare function parseAndValidateResponse(response: string, config?: ParseConfig): ParsedResponse;
/**
 * Enhanced response parser with comprehensive recovery mechanisms
 *
 * @param response - Raw OpenAI response
 * @param options - Original analysis options for context
 * @returns Parsed response with fallback data if needed
 */
export declare function parseResponseWithRecovery(response: string, options: AnalysisOptions): ParsedResponse;
export {};
//# sourceMappingURL=responseValidation.d.ts.map