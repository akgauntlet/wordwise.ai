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

import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { 
  AIAnalysisResult,
  AIAnalysisError,
  AnalyzeTextCallableRequest
} from '../types/ai';
import { 
  initializeOpenAI,
  generateSystemPrompt,
  generateUserPrompt,
  parseOpenAIResponse,
  handleOpenAIError,
  calculateContentHash,
  validateAnalysisRequest
} from '../utils/openai';
import { checkRateLimit } from '../utils/rateLimiting';

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
export const analyzeText = onCall(
  { 
    cors: true,
    enforceAppCheck: false, // Set to true in production with App Check
    memory: '1GiB',
    timeoutSeconds: 60,
    region: 'us-central1',
    secrets: ['OPENAI_API_KEY']
  },
  async (request: AnalyzeTextCallableRequest) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    
    console.log(`[${requestId}] Starting text analysis request`);
    
    // Initialize variables for error handling scope
    let userId: string;
    let content: string;
    let options: import('../types/ai').AnalysisOptions;
    
    try {
      // Validate authentication
      if (!request.auth) {
        throw new HttpsError(
          'unauthenticated',
          'Authentication required for text analysis'
        );
      }
      
      userId = request.auth.uid;
      ({ content, options } = request.data);
      
      console.log(`[${requestId}] Processing request for user: ${userId}`);
      console.log(`[${requestId}] Content length: ${content.length} characters`);
      
      // Validate request data
      validateAnalysisRequest(content, options);
      
      // Check rate limits (immediate write for full analysis)
      await checkRateLimit(userId, content.length, false);
      
      // Calculate content hash for caching
      const contentHash = calculateContentHash(content, options);
      
      // Check cache first
      const cachedResult = await getCachedAnalysis(contentHash, userId);
      if (cachedResult) {
        console.log(`[${requestId}] Returning cached result`);
        return {
          success: true,
          data: cachedResult,
          requestId
        };
      }
      
      // Initialize OpenAI client
      const openai = initializeOpenAI();
      
      // Generate prompts
      const systemPrompt = generateSystemPrompt(options);
      const userPrompt = generateUserPrompt(content);
      
      console.log(`[${requestId}] Sending request to OpenAI`);
      
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Fast and cost-effective model for text analysis
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2, // Lower temperature for faster, more consistent analysis
        max_tokens: 2000 // Reduced tokens for faster processing with simplified prompts
      });
      
      const aiResponse = completion.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('Empty response from OpenAI API');
      }
      
      console.log(`[${requestId}] Received response from OpenAI`);
      
      // Parse the AI response with enhanced validation
      const parsedResponse = parseOpenAIResponse(aiResponse, options);
      
      // Build the final analysis result
      const analysisResult: AIAnalysisResult = {
        analysisId: requestId,
        timestamp: new Date(),
        contentHash,
        grammarSuggestions: parsedResponse.grammarSuggestions,
        styleSuggestions: parsedResponse.styleSuggestions,
        readabilitySuggestions: parsedResponse.readabilitySuggestions,
        readabilityMetrics: parsedResponse.readabilityMetrics,
        totalSuggestions: parsedResponse.grammarSuggestions.length + 
                         parsedResponse.styleSuggestions.length + 
                         parsedResponse.readabilitySuggestions.length,
        options,
        processingTimeMs: Date.now() - startTime
      };
      
      // Cache the result for future requests (only if analysis was successful)
      if (analysisResult.totalSuggestions > 0 || content.length > 500) {
        await cacheAnalysisResult(contentHash, analysisResult, userId);
      }
      
      console.log(`[${requestId}] Analysis completed successfully in ${analysisResult.processingTimeMs}ms`);
      console.log(`[${requestId}] Found ${analysisResult.totalSuggestions} total suggestions`);
      
      return {
        success: true,
        data: analysisResult,
        requestId
      };
      
    } catch (error) {
      console.error(`[${requestId}] Analysis failed:`, error);
      
      // Handle different types of errors with enhanced recovery
      let analysisError: AIAnalysisError;
      
      if (error && typeof error === 'object' && 'code' in error) {
        // Already an AIAnalysisError
        analysisError = error as AIAnalysisError;
      } else if (error instanceof HttpsError) {
        // Firebase Functions error
        analysisError = {
          code: 'API_ERROR',
          message: error.message,
          details: `Firebase error: ${error.code}`
        };
      } else if (error && typeof error === 'object' && 'status' in error) {
        // OpenAI API error
        analysisError = handleOpenAIError(error);
      } else {
        // Unknown error
        analysisError = {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred during analysis. Please try again.',
          details: error instanceof Error ? error.message : 'Unknown error'
        };
      }
      
      return {
        success: false,
        error: analysisError,
        requestId
      };
    }
  }
);

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if we have a cached analysis result for this content (optimized)
 * 
 * @param contentHash - Hash of the content and options
 * @param userId - User ID for cache isolation
 * @returns Cached analysis result or null
 */
async function getCachedAnalysis(
  contentHash: string, 
  userId: string
): Promise<AIAnalysisResult | null> {
  try {
    const db = getFirestore();
    const cacheRef = db.collection('analysisCache').doc(`${userId}_${contentHash}`);
    const doc = await cacheRef.get();
    
    if (!doc.exists) {
      return null;
    }
    
    const cachedData = doc.data();
    
    // Check if cache is still valid (24 hours)
    const cacheAge = Date.now() - cachedData!.timestamp.toMillis();
    const cacheValidityMs = 24 * 60 * 60 * 1000; // 24 hours
    
    if (cacheAge > cacheValidityMs) {
      // Don't delete expired cache immediately to avoid extra operations
      // Let it be cleaned up by background processes
      return null;
    }
    
    // Convert Firestore timestamp back to Date
    return {
      ...cachedData,
      timestamp: cachedData!.timestamp.toDate()
    } as AIAnalysisResult;
    
  } catch (error) {
    console.error('Error checking analysis cache:', error);
    return null; // Don't fail the request if cache check fails
  }
}

/**
 * Cache the analysis result for future requests (optimized)
 * 
 * @param contentHash - Hash of the content and options
 * @param result - Analysis result to cache
 * @param userId - User ID for cache isolation
 */
async function cacheAnalysisResult(
  contentHash: string, 
  result: AIAnalysisResult,
  userId: string
): Promise<void> {
  try {
    const db = getFirestore();
    const cacheRef = db.collection('analysisCache').doc(`${userId}_${contentHash}`);
    
    // Use merge to avoid overwriting if another process already cached this
    await cacheRef.set({
      ...result,
      cachedAt: new Date()
    }, { merge: true });
    
  } catch (error) {
    console.error('Error caching analysis result:', error);
    // Don't fail the request if caching fails
  }
} 
