/**
 * @fileoverview Simplified response parsing utilities for AI analysis
 * @module utils/responseValidation
 * @author WordWise.ai Team
 * @created 2024-01-XX
 *
 * Dependencies:
 * - AI types for validation schemas
 *
 * Usage:
 * - Fast parsing of OpenAI API responses
 * - Basic validation with minimal overhead
 * - Optimized for simplified prompts and reliable GPT-3.5 Turbo responses
 */
import { GrammarSuggestion, StyleSuggestion, ReadabilitySuggestion, ReadabilityMetrics } from '../types/ai';
/**
 * Simplified parsed response interface
 */
interface ParsedResponse {
    grammarSuggestions: GrammarSuggestion[];
    styleSuggestions: StyleSuggestion[];
    readabilitySuggestions: ReadabilitySuggestion[];
    readabilityMetrics: ReadabilityMetrics;
    parseMetadata?: {
        originalLength: number;
        cleanedLength: number;
        parseAttempts: number;
        warnings: string[];
        fallbacksUsed: string[];
    };
}
/**
 * Simplified response parser optimized for clean GPT-3.5 Turbo responses
 *
 * @param response - Raw response from OpenAI API
 * @returns Parsed and validated response data
 *
 * @throws {AIAnalysisError} When response is completely invalid
 */
export declare function parseAndValidateResponse(response: string): ParsedResponse;
/**
 * Simplified recovery parser - just returns basic structure if primary fails
 *
 * @param response - Raw OpenAI response
 * @returns Parsed response with fallback data if needed
 */
export declare function parseResponseWithRecovery(response: string): ParsedResponse;
export {};
//# sourceMappingURL=responseValidation.d.ts.map