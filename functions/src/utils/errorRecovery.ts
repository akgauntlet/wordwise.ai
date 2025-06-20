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

import { getFirestore } from 'firebase-admin/firestore';
import { AIAnalysisError, AnalysisOptions } from '../types/ai';

/**
 * Error severity levels for monitoring and alerting
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error category for classification and analysis
 */
export enum ErrorCategory {
  PARSE_ERROR = 'parse_error',
  API_ERROR = 'api_error',
  VALIDATION_ERROR = 'validation_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  TIMEOUT_ERROR = 'timeout_error',
  NETWORK_ERROR = 'network_error'
}

/**
 * Error tracking data structure
 */
interface ErrorReport {
  errorId: string;
  timestamp: Date;
  userId: string;
  requestId: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  error: AIAnalysisError;
  context: {
    analysisOptions: AnalysisOptions;
    contentLength: number;
    retryAttempt: number;
    parseMetadata?: any;
  };
  resolution?: {
    recoveryMethod: string;
    successful: boolean;
    fallbackUsed: boolean;
  };
}

/**
 * Retry configuration for different error types
 */
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  exponentialBackoff: boolean;
  retryableErrors: ErrorCategory[];
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponentialBackoff: true,
  retryableErrors: [
    ErrorCategory.API_ERROR,
    ErrorCategory.TIMEOUT_ERROR,
    ErrorCategory.NETWORK_ERROR
  ]
};

/**
 * Enhanced error handler with recovery mechanisms
 * 
 * @param error - Original error object
 * @param context - Request context for error analysis
 * @returns Processed error with recovery suggestions
 */
export async function handleErrorWithRecovery(
  error: any,
  context: {
    userId: string;
    requestId: string;
    analysisOptions: AnalysisOptions;
    contentLength: number;
    retryAttempt?: number;
  }
): Promise<{
  processedError: AIAnalysisError;
  shouldRetry: boolean;
  retryDelay: number;
  fallbackData?: any;
}> {
  console.log(`[ErrorRecovery] Processing error for request ${context.requestId}`);
  
  // Categorize and process the error
  const errorCategory = categorizeError(error);
  const errorSeverity = determineSeverity(error, errorCategory);
  const processedError = processError(error, errorCategory);
  
  // Create error report
  const errorReport: ErrorReport = {
    errorId: generateErrorId(),
    timestamp: new Date(),
    userId: context.userId,
    requestId: context.requestId,
    category: errorCategory,
    severity: errorSeverity,
    error: processedError,
    context: {
      analysisOptions: context.analysisOptions,
      contentLength: context.contentLength,
      retryAttempt: context.retryAttempt || 0
    }
  };
  
  // Log error for monitoring
  await logError(errorReport);
  
  // Determine retry strategy
  const retryDecision = determineRetryStrategy(errorCategory, context.retryAttempt || 0);
  
  // Generate fallback data if needed
  const fallbackData = shouldProvideFallback(errorCategory, errorSeverity) 
    ? generateFallbackResponse(context.analysisOptions)
    : undefined;
  
  if (fallbackData) {
    errorReport.resolution = {
      recoveryMethod: 'fallback_response',
      successful: true,
      fallbackUsed: true
    };
    await updateErrorReport(errorReport);
  }
  
  return {
    processedError,
    shouldRetry: retryDecision.shouldRetry,
    retryDelay: retryDecision.delay,
    fallbackData
  };
}

/**
 * Categorize error based on type and characteristics
 * 
 * @param error - Error object to categorize
 * @returns Error category for proper handling
 */
function categorizeError(error: any): ErrorCategory {
  // Network and timeout errors
  if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
    return ErrorCategory.TIMEOUT_ERROR;
  }
  
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return ErrorCategory.NETWORK_ERROR;
  }
  
  // OpenAI API specific errors
  if (error.status) {
    if (error.status === 429) {
      return ErrorCategory.RATE_LIMIT_ERROR;
    }
    if (error.status >= 400 && error.status < 500) {
      return ErrorCategory.API_ERROR;
    }
    if (error.status >= 500) {
      return ErrorCategory.API_ERROR;
    }
  }
  
  // Parsing and validation errors
  if (error.message && (
    error.message.includes('JSON') || 
    error.message.includes('parse') ||
    error.message.includes('validation')
  )) {
    return ErrorCategory.PARSE_ERROR;
  }
  
  // AI analysis specific errors
  if (error.code && [
    'RATE_LIMIT_EXCEEDED',
    'CONTENT_TOO_LONG',
    'INVALID_CONTENT'
  ].includes(error.code)) {
    return ErrorCategory.VALIDATION_ERROR;
  }
  
  // Default to API error for unclassified errors
  return ErrorCategory.API_ERROR;
}

/**
 * Determine error severity based on category and impact
 * 
 * @param error - Error object
 * @param category - Error category
 * @returns Severity level for monitoring
 */
function determineSeverity(error: any, category: ErrorCategory): ErrorSeverity {
  switch (category) {
    case ErrorCategory.RATE_LIMIT_ERROR:
      return ErrorSeverity.HIGH;
    
    case ErrorCategory.PARSE_ERROR:
      return ErrorSeverity.MEDIUM;
    
    case ErrorCategory.VALIDATION_ERROR:
      return ErrorSeverity.LOW;
    
    case ErrorCategory.TIMEOUT_ERROR:
    case ErrorCategory.NETWORK_ERROR:
      return ErrorSeverity.MEDIUM;
    
    case ErrorCategory.API_ERROR:
      if (error.status >= 500) {
        return ErrorSeverity.HIGH;
      }
      return ErrorSeverity.MEDIUM;
    
    default:
      return ErrorSeverity.MEDIUM;
  }
}

/**
 * Process error into standardized format
 * 
 * @param error - Original error
 * @param category - Error category
 * @returns Standardized AI analysis error
 */
function processError(error: any, category: ErrorCategory): AIAnalysisError {
  switch (category) {
    case ErrorCategory.RATE_LIMIT_ERROR:
      return {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Analysis service is temporarily busy. Please try again in a moment.',
        retryAfter: 60
      };
    
    case ErrorCategory.PARSE_ERROR:
      return {
        code: 'API_ERROR',
        message: 'Unable to process the analysis response. Please try again.',
        details: 'Response parsing failed'
      };
    
    case ErrorCategory.VALIDATION_ERROR:
      return {
        code: 'INVALID_CONTENT',
        message: error.message || 'Content validation failed',
        details: error.details || 'Content does not meet analysis requirements'
      };
    
    case ErrorCategory.TIMEOUT_ERROR:
      return {
        code: 'API_ERROR',
        message: 'Analysis request timed out. Please try again with shorter text.',
        details: 'Request timeout'
      };
    
    case ErrorCategory.NETWORK_ERROR:
      return {
        code: 'API_ERROR',
        message: 'Network connection issue. Please check your connection and try again.',
        details: 'Network error'
      };
    
    case ErrorCategory.API_ERROR:
    default:
      return {
        code: 'API_ERROR',
        message: 'Analysis service temporarily unavailable. Please try again.',
        details: error.message || 'API error'
      };
  }
}

/**
 * Determine retry strategy based on error type and attempt count
 * 
 * @param category - Error category
 * @param currentAttempt - Current retry attempt number
 * @param config - Retry configuration
 * @returns Retry decision and delay
 */
function determineRetryStrategy(
  category: ErrorCategory,
  currentAttempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): { shouldRetry: boolean; delay: number } {
  // Check if error type is retryable
  if (!config.retryableErrors.includes(category)) {
    return { shouldRetry: false, delay: 0 };
  }
  
  // Check if max attempts exceeded
  if (currentAttempt >= config.maxAttempts) {
    return { shouldRetry: false, delay: 0 };
  }
  
  // Calculate retry delay
  let delay = config.baseDelay;
  if (config.exponentialBackoff) {
    delay = Math.min(
      config.baseDelay * Math.pow(2, currentAttempt),
      config.maxDelay
    );
  }
  
  // Add jitter to prevent thundering herd
  delay += Math.random() * 1000;
  
  return { shouldRetry: true, delay };
}

/**
 * Determine if fallback response should be provided
 * 
 * @param category - Error category
 * @param severity - Error severity
 * @returns Whether to provide fallback data
 */
function shouldProvideFallback(category: ErrorCategory, severity: ErrorSeverity): boolean {
  // Provide fallback for parse errors and high-severity issues
  return category === ErrorCategory.PARSE_ERROR || severity === ErrorSeverity.HIGH;
}

/**
 * Generate fallback response when AI analysis fails
 * 
 * @param options - Original analysis options
 * @returns Basic fallback analysis result
 */
function generateFallbackResponse(options: AnalysisOptions): any {
  console.log('[ErrorRecovery] Generating fallback response');
  
  return {
    grammarSuggestions: [],
    styleSuggestions: [],
    readabilitySuggestions: [],
    readabilityMetrics: {
      fleschScore: 50,
      gradeLevel: 12,
      avgSentenceLength: 15,
      avgSyllablesPerWord: 1.5,
      wordCount: 0,
      sentenceCount: 0,
      complexWordsPercent: 15
    },
    parseMetadata: {
      originalLength: 0,
      cleanedLength: 0,
      parseAttempts: 0,
      warnings: ['Fallback response due to analysis failure'],
      fallbacksUsed: ['Error recovery fallback']
    }
  };
}

/**
 * Log error to Firestore for monitoring and analysis
 * 
 * @param errorReport - Error report to log
 */
async function logError(errorReport: ErrorReport): Promise<void> {
  try {
    const db = getFirestore();
    const errorRef = db.collection('errorReports').doc(errorReport.errorId);
    
    await errorRef.set({
      ...errorReport,
      timestamp: new Date() // Ensure Firestore timestamp
    });
    
    console.log(`[ErrorRecovery] Logged error ${errorReport.errorId}`);
  } catch (error) {
    console.error('[ErrorRecovery] Failed to log error:', error);
    // Don't throw - logging failure shouldn't break the main flow
  }
}

/**
 * Update error report with resolution information
 * 
 * @param errorReport - Error report to update
 */
async function updateErrorReport(errorReport: ErrorReport): Promise<void> {
  try {
    const db = getFirestore();
    const errorRef = db.collection('errorReports').doc(errorReport.errorId);
    
    await errorRef.update({
      resolution: errorReport.resolution,
      resolvedAt: new Date()
    });
  } catch (error) {
    console.error('[ErrorRecovery] Failed to update error report:', error);
  }
}

/**
 * Generate unique error ID for tracking
 * 
 * @returns Unique error identifier
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Retry wrapper for async operations with exponential backoff
 * 
 * @param operation - Async operation to retry
 * @param context - Context for error handling
 * @param config - Retry configuration
 * @returns Promise resolving to operation result
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  context: {
    userId: string;
    requestId: string;
    analysisOptions: AnalysisOptions;
    contentLength: number;
  },
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      const recovery = await handleErrorWithRecovery(error, {
        ...context,
        retryAttempt: attempt
      });
      
      if (!recovery.shouldRetry || attempt === config.maxAttempts) {
        if (recovery.fallbackData) {
          console.log('[ErrorRecovery] Using fallback data after exhausting retries');
          return recovery.fallbackData as T;
        }
        throw recovery.processedError;
      }
      
      console.log(`[ErrorRecovery] Retrying in ${recovery.retryDelay}ms (attempt ${attempt + 1}/${config.maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, recovery.retryDelay));
    }
  }
  
  throw lastError;
}

/**
 * Get error statistics for monitoring dashboard
 * 
 * @param timeRange - Time range for statistics (hours)
 * @returns Error statistics summary
 */
export async function getErrorStatistics(timeRange: number = 24): Promise<{
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  recoveryRate: number;
  topErrors: Array<{ message: string; count: number }>;
}> {
  try {
    const db = getFirestore();
    const cutoffTime = new Date(Date.now() - timeRange * 60 * 60 * 1000);
    
    const snapshot = await db.collection('errorReports')
      .where('timestamp', '>=', cutoffTime)
      .get();
    
    const errors = snapshot.docs.map(doc => doc.data() as ErrorReport);
    
    const stats = {
      totalErrors: errors.length,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      recoveryRate: 0,
      topErrors: [] as Array<{ message: string; count: number }>
    };
    
    // Calculate category distribution
    Object.values(ErrorCategory).forEach(category => {
      stats.errorsByCategory[category] = errors.filter(e => e.category === category).length;
    });
    
    // Calculate severity distribution
    Object.values(ErrorSeverity).forEach(severity => {
      stats.errorsBySeverity[severity] = errors.filter(e => e.severity === severity).length;
    });
    
    // Calculate recovery rate
    const recoveredErrors = errors.filter(e => e.resolution?.successful).length;
    stats.recoveryRate = errors.length > 0 ? recoveredErrors / errors.length : 0;
    
    // Calculate top error messages
    const errorCounts = new Map<string, number>();
    errors.forEach(error => {
      const message = error.error.message;
      errorCounts.set(message, (errorCounts.get(message) || 0) + 1);
    });
    
    stats.topErrors = Array.from(errorCounts.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return stats;
  } catch (error) {
    console.error('[ErrorRecovery] Failed to get error statistics:', error);
    throw error;
  }
} 
