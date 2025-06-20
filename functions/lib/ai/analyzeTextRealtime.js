"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeTextRealtime = void 0;
const https_1 = require("firebase-functions/v2/https");
const openai_1 = require("../utils/openai");
const rateLimiting_1 = require("../utils/rateLimiting");
const responseValidation_1 = require("../utils/responseValidation");
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
exports.analyzeTextRealtime = (0, https_1.onCall)({
    cors: true,
    enforceAppCheck: false,
    memory: '512MiB', // Lower memory for lightweight function
    timeoutSeconds: 30, // Shorter timeout for real-time
    region: 'us-central1',
    secrets: ['OPENAI_API_KEY']
}, async (request) => {
    var _a, _b;
    const startTime = Date.now();
    const requestId = request.data.requestId || generateRealtimeRequestId();
    console.log(`[RT-${requestId}] Starting real-time analysis request`);
    console.log(`[RT-${requestId}] Function updated with OpenAI config fix`);
    try {
        // Validate authentication
        if (!request.auth) {
            throw new https_1.HttpsError('unauthenticated', 'Authentication required for real-time analysis');
        }
        const userId = request.auth.uid;
        const { content, options, contentHash } = request.data;
        console.log(`[RT-${requestId}] Processing request for user: ${userId}`);
        console.log(`[RT-${requestId}] Content length: ${content.length} characters`);
        // Validate request data with more lenient limits for real-time
        validateRealtimeRequest(content, options);
        // Check rate limits (shared with main analysis)
        await (0, rateLimiting_1.checkRateLimit)(userId, content.length);
        // Calculate or use provided content hash
        const finalContentHash = contentHash || (0, openai_1.calculateContentHash)(content, options);
        // Initialize OpenAI client
        const openai = (0, openai_1.initializeOpenAI)();
        // Generate lightweight prompts
        const systemPrompt = generateLightweightSystemPrompt(options);
        const userPrompt = generateLightweightUserPrompt(content);
        console.log(`[RT-${requestId}] Sending lightweight request to OpenAI`);
        console.log(`[RT-${requestId}] Request details: model=gpt-4o-mini, content_length=${content.length}`);
        // Call OpenAI API with optimized parameters for speed
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Fast, cost-effective model
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.2, // Lower temperature for consistent, faster responses
            max_tokens: 2000 // Reduced token limit for speed
        });
        const aiResponse = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
        if (!aiResponse) {
            throw new Error('Empty response from OpenAI API');
        }
        console.log(`[RT-${requestId}] Received response from OpenAI`);
        // Parse the AI response with lightweight validation
        const parsedResponse = (0, responseValidation_1.parseAndValidateResponse)(aiResponse);
        // Build the lightweight analysis result
        const analysisResult = {
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
    }
    catch (error) {
        console.error(`[RT-${requestId}] Real-time analysis failed:`, error);
        // Handle errors with lightweight approach
        let analysisError;
        if (error && typeof error === 'object' && 'code' in error) {
            analysisError = error;
        }
        else if (error instanceof https_1.HttpsError) {
            analysisError = {
                code: 'API_ERROR',
                message: error.message,
                details: `Firebase error: ${error.code}`
            };
        }
        else if (error && typeof error === 'object' && 'status' in error) {
            analysisError = (0, openai_1.handleOpenAIError)(error);
        }
        else {
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
});
/**
 * Generate unique request ID for real-time analysis
 */
function generateRealtimeRequestId() {
    return `rt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}
/**
 * Validate real-time analysis request with more lenient limits
 *
 * @param content - Text content to analyze
 * @param options - Analysis options
 */
function validateRealtimeRequest(content, options) {
    if (!content || typeof content !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'Content is required and must be a string');
    }
    if (content.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'Content cannot be empty');
    }
    // More lenient limit for real-time analysis (5000 vs 10000 for full analysis)
    if (content.length > 5000) {
        throw new https_1.HttpsError('invalid-argument', 'Content too long for real-time analysis. Maximum 5000 characters.');
    }
    if (!options || typeof options !== 'object') {
        throw new https_1.HttpsError('invalid-argument', 'Analysis options are required');
    }
}
/**
 * Generate lightweight system prompt optimized for speed
 *
 * @param options - Analysis options
 * @returns Lightweight system prompt
 */
function generateLightweightSystemPrompt(options) {
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
function generateLightweightUserPrompt(content) {
    return `Analyze this text for real-time feedback. Focus on the most important issues:

"${content}"

Provide top suggestions in JSON format.`;
}
//# sourceMappingURL=analyzeTextRealtime.js.map