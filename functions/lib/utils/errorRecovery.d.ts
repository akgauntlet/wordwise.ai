/**
 * @fileoverview Error recovery and monitoring utilities for AI analysis
 * @module utils/errorRecovery
 * @author WordWise.ai Team
 * @created 2024-01-XX
 *
 * Dependencies:
 * - Firebase Admin for error logging
 * - AI types for error categorization
 *
 * Usage:
 * - Monitor AI response quality and performance
 * - Implement retry mechanisms for failed requests
 * - Track error patterns for prompt optimization
 * - Provide fallback responses for critical failures
 */
import { AIAnalysisError, AnalysisOptions } from '../types/ai';
/**
 * Error severity levels for monitoring and alerting
 */
export declare enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
/**
 * Error category for classification and analysis
 */
export declare enum ErrorCategory {
    PARSE_ERROR = "parse_error",
    API_ERROR = "api_error",
    VALIDATION_ERROR = "validation_error",
    RATE_LIMIT_ERROR = "rate_limit_error",
    TIMEOUT_ERROR = "timeout_error",
    NETWORK_ERROR = "network_error"
}
/**
 * Retry configuration for different error types
 */
interface RetryConfig {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
    exponentialBackoff: boolean;
    retryableErrors: ErrorCategory[];
}
/**
 * Enhanced error handler with recovery mechanisms
 *
 * @param error - Original error object
 * @param context - Request context for error analysis
 * @returns Processed error with recovery suggestions
 */
export declare function handleErrorWithRecovery(error: any, context: {
    userId: string;
    requestId: string;
    analysisOptions: AnalysisOptions;
    contentLength: number;
    retryAttempt?: number;
}): Promise<{
    processedError: AIAnalysisError;
    shouldRetry: boolean;
    retryDelay: number;
    fallbackData?: any;
}>;
/**
 * Retry wrapper for async operations with exponential backoff
 *
 * @param operation - Async operation to retry
 * @param context - Context for error handling
 * @param config - Retry configuration
 * @returns Promise resolving to operation result
 */
export declare function retryWithBackoff<T>(operation: () => Promise<T>, context: {
    userId: string;
    requestId: string;
    analysisOptions: AnalysisOptions;
    contentLength: number;
}, config?: RetryConfig): Promise<T>;
/**
 * Get error statistics for monitoring dashboard
 *
 * @param timeRange - Time range for statistics (hours)
 * @returns Error statistics summary
 */
export declare function getErrorStatistics(timeRange?: number): Promise<{
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    recoveryRate: number;
    topErrors: Array<{
        message: string;
        count: number;
    }>;
}>;
export {};
//# sourceMappingURL=errorRecovery.d.ts.map