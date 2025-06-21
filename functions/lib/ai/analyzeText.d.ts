/**
 * @fileoverview Main AI text analysis function for WordWise.ai
 * @module ai/analyzeText
 * @author WordWise.ai Team
 * @created 2024-01-XX
 *
 * Dependencies:
 * - OpenAI SDK for AI text analysis
 * - Firebase Functions for HTTP callable function
 * - Firebase Admin for authentication and Firestore
 *
 * Usage:
 * - Primary entry point for all AI text analysis requests
 * - Handles authentication, rate limiting, and caching
 * - Returns structured suggestions for grammar, style, and readability
 *
 * SECURITY: API keys are protected in Firebase Functions environment
 * RATE LIMITING: 100 requests per user per hour, 1M characters per hour
 * OPTIMIZED: Reduced Firestore operations for better performance
 */
import { AIAnalysisResult, AIAnalysisError } from '../types/ai';
/**
 * HTTP Callable Function: analyzeText
 *
 * Analyzes text content for grammar, style, and readability suggestions
 * using OpenAI's GPT models. Includes rate limiting, caching, and
 * comprehensive error handling.
 *
 * @param request - Text content and analysis options
 * @param context - Firebase Functions context with authentication
 * @returns Promise resolving to analysis results or error
 *
 * @example
 * ```typescript
 * const analyzeText = httpsCallable(functions, 'analyzeText');
 * const result = await analyzeText({
 *   content: "The quick brown fox jumps over the lazy dog.",
 *   options: {
 *     includeGrammar: true,
 *     includeStyle: true,
 *     includeReadability: false
 *   },
 *   userId: "user123"
 * });
 * ```
 */
export declare const analyzeText: import("firebase-functions/v2/https").CallableFunction<import("../types/ai").AnalyzeTextRequest, Promise<{
    success: boolean;
    data: AIAnalysisResult;
    requestId: string;
    error?: undefined;
} | {
    success: boolean;
    error: AIAnalysisError;
    requestId: string;
    data?: undefined;
}>>;
//# sourceMappingURL=analyzeText.d.ts.map