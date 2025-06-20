/**
 * @fileoverview OpenAI integration utilities for AI text analysis
 * @module utils/openai
 * @author WordWise.ai Team
 * @created 2024-01-XX
 *
 * Dependencies:
 * - OpenAI SDK for API communication
 * - Firebase Functions for environment configuration
 *
 * Usage:
 * - Initialize OpenAI client with secure API key
 * - Generate analysis prompts for different suggestion types
 * - Parse OpenAI responses into structured suggestions
 * - Handle API errors and rate limiting
 */
import OpenAI from 'openai';
import { AnalysisOptions, GrammarSuggestion, StyleSuggestion, ReadabilitySuggestion, ReadabilityMetrics, AIAnalysisError } from '../types/ai';
/**
 * Initialize OpenAI client with API key from environment variables
 * SECURITY: API key is stored in Firebase Functions environment variables (v2)
 */
export declare function initializeOpenAI(): OpenAI;
/**
 * Generate system prompt for AI analysis based on options
 * Uses comprehensive prompt templates with ESL-specific guidance
 *
 * @param options - Analysis configuration options
 * @returns Formatted system prompt for OpenAI
 */
export declare function generateSystemPrompt(options: AnalysisOptions): string;
/**
 * Generate user prompt with the text to analyze
 * Uses enhanced prompt templates with educational reminders
 *
 * @param content - Text content to analyze
 * @param specificInstructions - Optional specific instructions for this analysis
 * @returns Formatted user prompt
 */
export declare function generateUserPrompt(content: string, specificInstructions?: string): string;
/**
 * Parse OpenAI response and extract structured suggestions
 * Enhanced with comprehensive validation and fallback parsing
 *
 * @param response - Raw response from OpenAI API
 * @param options - Analysis options for context-aware recovery
 * @returns Parsed suggestions and metrics with metadata
 *
 * @throws {AIAnalysisError} When response format is completely invalid
 */
export declare function parseOpenAIResponse(response: string, options?: AnalysisOptions): {
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
};
/**
 * Handle OpenAI API errors and convert to user-friendly messages
 *
 * @param error - Error from OpenAI API call
 * @returns Structured error information
 */
export declare function handleOpenAIError(error: any): AIAnalysisError;
/**
 * Calculate content hash for caching purposes
 *
 * @param content - Text content to hash
 * @param options - Analysis options to include in hash
 * @returns Hash string for caching
 */
export declare function calculateContentHash(content: string, options: AnalysisOptions): string;
/**
 * Validate analysis request content and options
 *
 * @param content - Text content to validate
 * @param options - Analysis options to validate
 * @throws {AIAnalysisError} When validation fails
 */
export declare function validateAnalysisRequest(content: string, options: AnalysisOptions): void;
//# sourceMappingURL=openai.d.ts.map