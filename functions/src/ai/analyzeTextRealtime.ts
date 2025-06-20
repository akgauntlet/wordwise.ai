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

import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { 
  AIAnalysisError,
  AnalysisOptions,
  GrammarSuggestion,
  StyleSuggestion,
  ReadabilitySuggestion,
  ReadabilityMetrics,
  AnalyzeTextRealtimeCallableRequest
} from '../types/ai';
import { 
  initializeOpenAI,
  calculateContentHash,
  handleOpenAIError
} from '../utils/openai';
import { checkRateLimit } from '../utils/rateLimiting';
import { parseAndValidateResponse } from '../utils/responseValidation';

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
export const analyzeTextRealtime = onCall(
  { 
    cors: true,
    enforceAppCheck: false,
    memory: '512MiB', // Lower memory for lightweight function
    timeoutSeconds: 30, // Shorter timeout for real-time
    region: 'us-central1',
    secrets: ['OPENAI_API_KEY']
  },
  async (request: AnalyzeTextRealtimeCallableRequest) => {
    const startTime = Date.now();
    const requestId = request.data.requestId || generateRealtimeRequestId();
    
    console.log(`[RT-${requestId}] Starting real-time analysis request`);
    console.log(`[RT-${requestId}] Function updated with OpenAI config fix`);
    
    try {
      // Validate authentication
      if (!request.auth) {
        throw new HttpsError(
          'unauthenticated',
          'Authentication required for real-time analysis'
        );
      }
      
      const userId = request.auth.uid;
      const { content, options, contentHash } = request.data;
      
      console.log(`[RT-${requestId}] Processing request for user: ${userId}`);
      console.log(`[RT-${requestId}] Content length: ${content.length} characters`);
      
      // Validate request data with more lenient limits for real-time
      validateRealtimeRequest(content, options);
      
      // Check rate limits (shared with main analysis)
      await checkRateLimit(userId, content.length);
      
      // Calculate or use provided content hash
      const finalContentHash = contentHash || calculateContentHash(content, options);
      
      // Initialize OpenAI client
      const openai = initializeOpenAI();
      
      // Generate lightweight prompts
      const systemPrompt = generateLightweightSystemPrompt(options);
      const userPrompt = generateLightweightUserPrompt(content);
      
      console.log(`[RT-${requestId}] Sending lightweight request to OpenAI`);
      console.log(`[RT-${requestId}] Request details: model=gpt-4o, content_length=${content.length}`);
      
      // Call OpenAI API with optimized parameters for speed
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o', // High-quality model for enhanced analysis
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2, // Lower temperature for consistent, faster responses
        max_tokens: 2000 // Reduced token limit for speed
      });
      
      const aiResponse = completion.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('Empty response from OpenAI API');
      }
      
      console.log(`[RT-${requestId}] Received response from OpenAI`);
      
      // Parse the AI response with lightweight validation
      const parsedResponse = parseAndValidateResponse(aiResponse);
      
      // Build the lightweight analysis result
      const analysisResult: RealtimeAnalysisResult = {
        analysisId: requestId,
        timestamp: new Date(),
        contentHash: finalContentHash,
        grammarSuggestions: parsedResponse.grammarSuggestions,
        styleSuggestions: parsedResponse.styleSuggestions,
        readabilitySuggestions: parsedResponse.readabilitySuggestions,
        readabilityMetrics: parsedResponse.readabilityMetrics,
        totalSuggestions: parsedResponse.grammarSuggestions.length + 
                         parsedResponse.styleSuggestions.length + 
                         parsedResponse.readabilitySuggestions.length,
        processingTimeMs: Date.now() - startTime,
        isLightweight: true
      };
      
      console.log(`[RT-${requestId}] Real-time analysis completed in ${analysisResult.processingTimeMs}ms`);
      console.log(`[RT-${requestId}] Found ${analysisResult.totalSuggestions} suggestions`);
      
      return {
        success: true,
        data: analysisResult,
        requestId
      };
      
    } catch (error) {
      console.error(`[RT-${requestId}] Real-time analysis failed:`, error);
      
      // Handle errors with lightweight approach
      let analysisError: AIAnalysisError;
      
      if (error && typeof error === 'object' && 'code' in error) {
        analysisError = error as AIAnalysisError;
      } else if (error instanceof HttpsError) {
        analysisError = {
          code: 'API_ERROR',
          message: error.message,
          details: `Firebase error: ${error.code}`
        };
      } else if (error && typeof error === 'object' && 'status' in error) {
        analysisError = handleOpenAIError(error);
      } else {
        analysisError = {
          code: 'UNKNOWN_ERROR',
          message: 'Real-time analysis temporarily unavailable. Please try again.',
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
 * Generate unique request ID for real-time analysis
 */
function generateRealtimeRequestId(): string {
  return `rt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

/**
 * Validate real-time analysis request with more lenient limits
 * 
 * @param content - Text content to analyze
 * @param options - Analysis options
 */
function validateRealtimeRequest(content: string, options: AnalysisOptions): void {
  if (!content || typeof content !== 'string') {
    throw new HttpsError(
      'invalid-argument',
      'Content is required and must be a string'
    );
  }
  
  if (content.length === 0) {
    throw new HttpsError(
      'invalid-argument',
      'Content cannot be empty'
    );
  }
  
  // More lenient limit for real-time analysis (5000 vs 10000 for full analysis)
  if (content.length > 5000) {
    throw new HttpsError(
      'invalid-argument',
      'Content too long for real-time analysis. Maximum 5000 characters.'
    );
  }
  
  if (!options || typeof options !== 'object') {
    throw new HttpsError(
      'invalid-argument',
      'Analysis options are required'
    );
  }
}

/**
 * Generate lightweight system prompt optimized for speed
 * 
 * @param options - Analysis options
 * @returns Lightweight system prompt
 */
function generateLightweightSystemPrompt(options: AnalysisOptions): string {
  let prompt = `You are a helpful writing assistant optimized for real-time analysis. Provide concise, actionable suggestions.

RESPONSE FORMAT: Return valid JSON only, no markdown formatting.

{
  "grammarSuggestions": [...],
  "styleSuggestions": [...],
  "readabilitySuggestions": [...],
  "readabilityMetrics": {
    "fleschScore": 50,
    "gradeLevel": 12,
    "avgSentenceLength": 15,
    "avgSyllablesPerWord": 1.5,
    "wordCount": 0,
    "sentenceCount": 0,
    "complexWordsPercent": 15
  }
}

SUGGESTION FORMAT:
{
  "id": "unique_id",
  "type": "grammar|style|readability",
  "severity": "low|medium|high",
  "startOffset": 0,
  "endOffset": 5,
  "originalText": "original text",
  "suggestedText": "suggested text",
  "explanation": "Brief explanation",
  "category": "category_name",
  "confidence": 0.8
}

GUIDELINES:
- Focus on the most important issues first
- Provide brief, clear explanations
- Limit suggestions to top 10 per category for speed
- Prioritize grammar over style for real-time analysis`;

  // Add specific analysis types based on options
  if (options.includeGrammar) {
    prompt += '\n- Include grammar and spelling corrections';
  }
  
  if (options.includeStyle) {
    prompt += '\n- Include basic style improvements for clarity';
  }
  
  if (options.includeReadability) {
    prompt += '\n- Include essential readability suggestions';
  }

  return prompt;
}

/**
 * Generate lightweight user prompt
 * 
 * @param content - Text content to analyze
 * @returns Lightweight user prompt
 */
function generateLightweightUserPrompt(content: string): string {
  return `Analyze this text for real-time feedback. Focus on the most important issues:

"${content}"

Provide top suggestions in JSON format.`;
} 
