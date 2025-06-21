/**
 * @fileoverview Real-time text analysis hook for WordWise.ai editor
 * @module hooks/editor/useRealtimeAnalysis
 * @author WordWise.ai Team
 * @created 2024-01-XX
 * 
 * Dependencies:
 * - React hooks for state management
 * - Firebase Functions for real-time analysis
 * - Client-side caching utilities
 * 
 * Usage:
 * - Provides debounced real-time analysis with 2-second delay
 * - Implements client-side caching with content-hash
 * - Manages analysis queue and request cancellation
 * 
 * PERFORMANCE: Optimized for minimal API calls and fast responses
 * CACHING: 24-hour client-side cache with content-hash keys
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/auth/useAuth';
import type { 
  RealtimeAnalysisResult, 
  AnalysisOptions,
  RealtimeAnalysisError
} from '@/types/realtimeAnalysis';
import { 
  generateContentHash,
  getFromCache,
  setToCache,
  clearExpiredCache
} from '@/utils/realtimeAnalysisUtils';

/**
 * Analysis status enum for tracking current state
 */
export type AnalysisStatus = 
  | 'idle'           // No analysis in progress
  | 'pending'        // Waiting for debounce delay
  | 'analyzing'      // Analysis request in progress
  | 'complete'       // Analysis completed successfully
  | 'error'          // Analysis failed with error
  | 'cancelled';     // Analysis was cancelled

/**
 * Real-time analysis state interface
 */
interface RealtimeAnalysisState {
  status: AnalysisStatus;
  result: RealtimeAnalysisResult | null;
  error: RealtimeAnalysisError | null;
  lastAnalyzedContent: string;
  lastAnalyzedHash: string;
  requestId: string | null;
  processingTimeMs: number;
  cacheHit: boolean;
}

/**
 * Real-time analysis hook configuration
 */
interface UseRealtimeAnalysisConfig {
  /** Debounce delay in milliseconds (default: 2000) */
  debounceDelay?: number;
  /** Enable client-side caching (default: true) */
  enableCaching?: boolean;
  /** Cache TTL in hours (default: 24) */
  cacheTtlHours?: number;
  /** Analysis options for the API */
  analysisOptions: AnalysisOptions;
}

/**
 * Default configuration for real-time analysis
 */
const DEFAULT_CONFIG: Required<Omit<UseRealtimeAnalysisConfig, 'analysisOptions'>> = {
  debounceDelay: 2000,
  enableCaching: true,
  cacheTtlHours: 24
};

/**
 * Real-time analysis hook with intelligent debouncing and caching
 * 
 * @param config - Configuration options for real-time analysis
 * @returns Analysis state and control functions
 * 
 * @example
 * ```typescript
 * const {
 *   status,
 *   result,
 *   error,
 *   analyzeText,
 *   cancelAnalysis,
 *   clearResults
 * } = useRealtimeAnalysis({
 *   analysisOptions: {
 *     includeGrammar: true,
 *     includeStyle: false,
 *     includeReadability: false
 *   }
 * });
 * 
 * // Trigger analysis with auto-debouncing
 * analyzeText(editorContent);
 * ```
 */
export function useRealtimeAnalysis(config: UseRealtimeAnalysisConfig) {
  const { user } = useAuth();
  const fullConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  
  // State management
  const [state, setState] = useState<RealtimeAnalysisState>({
    status: 'idle',
    result: null,
    error: null,
    lastAnalyzedContent: '',
    lastAnalyzedHash: '',
    requestId: null,
    processingTimeMs: 0,
    cacheHit: false
  });
  
  // Refs for managing async operations
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentRequestRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Initialize Firebase Functions callable
  const analyzeTextRealtimeFunc = httpsCallable(functions, 'analyzeTextRealtime');
  
  /**
   * Clear any pending debounce timer
   */
  const clearDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);
  
  /**
   * Cancel current analysis request
   */
  const cancelCurrentRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    currentRequestRef.current = null;
  }, []);
  
  /**
   * Update analysis status with optional state changes
   */
  const updateStatus = useCallback((
    status: AnalysisStatus,
    updates: Partial<RealtimeAnalysisState> = {}
  ) => {
    setState(prev => ({
      ...prev,
      status,
      ...updates
    }));
  }, []);
  
  /**
   * Perform the actual analysis request
   */
  const performAnalysis = useCallback(async (
    content: string,
    contentHash: string,
    requestId: string
  ) => {
    if (!user) {
      updateStatus('error', { 
        error: { 
          code: 'UNAUTHENTICATED', 
          message: 'User authentication required for analysis',
          details: 'Please sign in to use real-time analysis'
        }
      });
      return;
    }
    
    try {
      // Create abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      currentRequestRef.current = requestId;
      
      const startTime = Date.now();
      updateStatus('analyzing', { requestId });
      
      // Check cache first if enabled
      if (fullConfig.enableCaching) {
        const cached = getFromCache(contentHash);
        if (cached) {
          // Cache hit for analysis
          updateStatus('complete', { 
            result: cached,
            lastAnalyzedContent: content,
            lastAnalyzedHash: contentHash,
            processingTimeMs: Date.now() - startTime,
            cacheHit: true,
            error: null
          });
          return;
        }
      }
      
      // Make API request
              // Making API request for analysis
      
      const response = await analyzeTextRealtimeFunc({
        content,
        options: fullConfig.analysisOptions,
        contentHash,
        requestId
      });
      
      // Check if request was cancelled
      if (currentRequestRef.current !== requestId) {
        // Analysis request cancelled
        return;
      }
      
      const responseData = response.data as { 
        success: boolean; 
        data?: RealtimeAnalysisResult;
        error?: RealtimeAnalysisError;
        requestId: string;
      };
      
      if (responseData.success && responseData.data) {
        const result = responseData.data;
        
        // Cache the result if enabled
        if (fullConfig.enableCaching) {
          setToCache(contentHash, result, fullConfig.cacheTtlHours);
        }
        
        updateStatus('complete', { 
          result,
          lastAnalyzedContent: content,
          lastAnalyzedHash: contentHash,
          processingTimeMs: Date.now() - startTime,
          cacheHit: false,
          error: null
        });
        
        // Analysis completed
        
      } else {
        throw new Error(responseData.error?.message || 'Analysis request failed');
      }
      
    } catch (error: unknown) {
      // Check if request was cancelled
      if (currentRequestRef.current !== requestId) {
        return;
      }
      
      console.error('[RealtimeAnalysis] Analysis failed:', error);
      
      // Type-safe error handling
      let errorCode = 'UNKNOWN_ERROR';
      let errorMessage = 'Real-time analysis failed';
      let errorDetails = 'An unexpected error occurred during analysis';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        const errorWithCode = error as Error & { code?: string; details?: string };
        if (errorWithCode.code) {
          errorCode = errorWithCode.code;
        }
        if (errorWithCode.details) {
          errorDetails = errorWithCode.details;
        }
      }
      
      const analysisError: RealtimeAnalysisError = {
        code: errorCode,
        message: errorMessage,
        details: errorDetails
      };
      
      updateStatus('error', { 
        error: analysisError,
        result: null
      });
    } finally {
      // Clean up request tracking
      if (currentRequestRef.current === requestId) {
        currentRequestRef.current = null;
        abortControllerRef.current = null;
      }
    }
  }, [user, fullConfig, analyzeTextRealtimeFunc, updateStatus]);
  
  /**
   * Trigger text analysis with intelligent debouncing
   * 
   * @param content - Text content to analyze
   */
  const analyzeText = useCallback((content: string) => {
    // Validate input
    if (!content || typeof content !== 'string') {
      updateStatus('idle', { result: null, error: null });
      return;
    }
    
    // Check content length limits
    if (content.length > 5000) {
      updateStatus('error', {
        error: {
          code: 'CONTENT_TOO_LONG',
          message: 'Content too long for real-time analysis',
          details: 'Maximum 5000 characters allowed for real-time analysis'
        }
      });
      return;
    }
    
    // Generate content hash
    const contentHash = generateContentHash(content, fullConfig.analysisOptions);
    

    
    // Clear any existing timers and requests
    clearDebounceTimer();
    cancelCurrentRequest();
    
    // Generate unique request ID
    const requestId = `rt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Update status to pending
    updateStatus('pending', { requestId });
    
    // Set debounce timer
    debounceTimerRef.current = setTimeout(() => {
      performAnalysis(content, contentHash, requestId);
    }, fullConfig.debounceDelay);
    
  }, [
    fullConfig,
    updateStatus,
    clearDebounceTimer,
    cancelCurrentRequest,
    performAnalysis
  ]);
  
  /**
   * Cancel any pending or in-progress analysis
   */
  const cancelAnalysis = useCallback(() => {
    clearDebounceTimer();
    cancelCurrentRequest();
    updateStatus('cancelled', { 
      requestId: null,
      error: null
    });
  }, [clearDebounceTimer, cancelCurrentRequest, updateStatus]);
  
  /**
   * Clear analysis results and reset to idle state
   */
  const clearResults = useCallback(() => {
    cancelAnalysis();
    setState({
      status: 'idle',
      result: null,
      error: null,
      lastAnalyzedContent: '',
      lastAnalyzedHash: '',
      requestId: null,
      processingTimeMs: 0,
      cacheHit: false
    });
  }, [cancelAnalysis]);
  
  /**
   * Get analysis statistics for debugging
   */
  const getAnalysisStats = useCallback(() => {
    return {
      status: state.status,
      lastAnalyzedLength: state.lastAnalyzedContent.length,
      suggestionsCount: state.result?.totalSuggestions || 0,
      processingTime: state.processingTimeMs,
      cacheHit: state.cacheHit,
      hasError: !!state.error
    };
  }, [state]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearDebounceTimer();
      cancelCurrentRequest();
    };
  }, [clearDebounceTimer, cancelCurrentRequest]);
  
  // Clear expired cache entries periodically
  useEffect(() => {
    if (fullConfig.enableCaching) {
      const cleanup = clearExpiredCache();
      return cleanup;
    }
  }, [fullConfig.enableCaching]);
  
  return {
    // State
    status: state.status,
    result: state.result,
    error: state.error,
    isAnalyzing: state.status === 'analyzing',
    isPending: state.status === 'pending',
    isComplete: state.status === 'complete',
    hasError: state.status === 'error',
    
    // Actions
    analyzeText,
    cancelAnalysis,
    clearResults,
    
    // Metadata
    processingTimeMs: state.processingTimeMs,
    cacheHit: state.cacheHit,
    requestId: state.requestId,
    
    // Debugging
    getAnalysisStats
  };
} 
