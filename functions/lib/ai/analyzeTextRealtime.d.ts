/**
 * @fileoverview Lightweight real-time AI text analysis function for WordWise.ai
 * @module ai/analyzeTextRealtime
 * @author WordWise.ai Team
 * @created 2024-01-XX
 *
 * Dependencies:
 * - OpenAI SDK for lightweight AI text analysis
 * - Firebase Functions for HTTP callable function
 * - Shared rate limiting and error handling from main analysis
 *
 * Usage:
 * - Real-time analysis with 2-second debounce
 * - Lightweight responses optimized for frequent requests
 * - Integrated with client-side caching and change detection
 *
 * PERFORMANCE: Optimized for speed and lower token usage
 * RATE LIMITING: Shares limits with main analysis function
 */
import { AIAnalysisError, GrammarSuggestion, StyleSuggestion, ReadabilitySuggestion, ReadabilityMetrics } from '../types/ai';
/**
 * Lightweight analysis result interface for real-time updates
 */
interface RealtimeAnalysisResult {
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
 * HTTP Callable Function: analyzeTextRealtime
 *
 * Provides lightweight, fast AI analysis optimized for real-time usage.
 * Uses simplified prompts and reduced token limits for speed.
 *
 * @param request - Text content and analysis options
 * @param context - Firebase Functions context with authentication
 * @returns Promise resolving to lightweight analysis results or error
 *
 * @example
 * ```typescript
 * const analyzeTextRealtime = httpsCallable(functions, 'analyzeTextRealtime');
 * const result = await analyzeTextRealtime({
 *   content: "The quick brown fox jumps over the lazy dog.",
 *   options: {
 *     includeGrammar: true,
 *     includeStyle: false,
 *     includeReadability: false
 *   },
 *   contentHash: "abc123...",
 *   requestId: "rt_req_123"
 * });
 * ```
 */
export declare const analyzeTextRealtime: import("firebase-functions/v2/https").CallableFunction<import("../types/ai").AnalyzeTextRealtimeRequest, Promise<{
    success: boolean;
    data: RealtimeAnalysisResult;
    requestId: string;
    error?: undefined;
} | {
    success: boolean;
    error: AIAnalysisError;
    requestId: string;
    data?: undefined;
}>>;
export {};
//# sourceMappingURL=analyzeTextRealtime.d.ts.map