"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeOpenAI = initializeOpenAI;
exports.generateSystemPrompt = generateSystemPrompt;
exports.generateUserPrompt = generateUserPrompt;
exports.parseOpenAIResponse = parseOpenAIResponse;
exports.handleOpenAIError = handleOpenAIError;
exports.calculateContentHash = calculateContentHash;
exports.validateAnalysisRequest = validateAnalysisRequest;
const openai_1 = __importDefault(require("openai"));
const crypto_1 = require("crypto");
const promptTemplates_1 = require("./promptTemplates");
const responseValidation_1 = require("./responseValidation");
/**
 * Initialize OpenAI client with API key from environment variables
 * SECURITY: API key is stored in Firebase Functions environment variables (v2)
 */
function initializeOpenAI() {
    console.log('[OpenAI] Initializing OpenAI client...');
    console.log('[OpenAI] Available environment variables:', Object.keys(process.env).filter(key => key.includes('OPENAI')));
    const apiKey = process.env.OPENAI_API_KEY;
    console.log(`[OpenAI] Environment variable check: ${apiKey ? 'found' : 'not found'}`);
    if (!apiKey) {
        console.error('[OpenAI] OPENAI_API_KEY environment variable not set');
        console.error('[OpenAI] All env vars:', Object.keys(process.env));
        throw new Error('OPENAI_API_KEY environment variable is required for Firebase Functions v2');
    }
    // Validate API key format
    if (!apiKey.startsWith('sk-')) {
        console.error('[OpenAI] Invalid API key format - should start with sk-');
        throw new Error('Invalid OpenAI API key format');
    }
    console.log(`[OpenAI] API key found (${apiKey.substring(0, 10)}...), initializing client`);
    return new openai_1.default({
        apiKey: apiKey,
        timeout: 30000, // 30 second timeout
        maxRetries: 2, // Retry failed requests
    });
}
/**
 * Generate system prompt for AI analysis based on options
 * Uses comprehensive prompt templates with ESL-specific guidance
 *
 * @param options - Analysis configuration options
 * @returns Formatted system prompt for OpenAI
 */
function generateSystemPrompt(options) {
    return (0, promptTemplates_1.generateComprehensiveSystemPrompt)(options);
}
/**
 * Generate user prompt with the text to analyze
 * Uses enhanced prompt templates with educational reminders
 *
 * @param content - Text content to analyze
 * @param specificInstructions - Optional specific instructions for this analysis
 * @returns Formatted user prompt
 */
function generateUserPrompt(content, specificInstructions) {
    return (0, promptTemplates_1.generateUserPrompt)(content, specificInstructions);
}
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
function parseOpenAIResponse(response, options) {
    var _a;
    try {
        console.log('[OpenAI] Starting enhanced response parsing');
        // Use enhanced parsing with recovery mechanisms
        const parsedResult = options
            ? (0, responseValidation_1.parseResponseWithRecovery)(response)
            : (0, responseValidation_1.parseAndValidateResponse)(response);
        console.log(`[OpenAI] Parse successful`);
        if (((_a = parsedResult.parseMetadata) === null || _a === void 0 ? void 0 : _a.warnings) && parsedResult.parseMetadata.warnings.length > 0) {
            console.warn('[OpenAI] Parse warnings:', parsedResult.parseMetadata.warnings);
        }
        return {
            grammarSuggestions: parsedResult.grammarSuggestions,
            styleSuggestions: parsedResult.styleSuggestions,
            readabilitySuggestions: parsedResult.readabilitySuggestions,
            readabilityMetrics: parsedResult.readabilityMetrics
        };
    }
    catch (error) {
        console.error('[OpenAI] Enhanced parsing failed:', error);
        // Final fallback - return basic error structure
        throw {
            code: 'API_ERROR',
            message: 'Failed to parse AI analysis response after all recovery attempts',
            details: `Enhanced parse error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
/**
 * Handle OpenAI API errors and convert to user-friendly messages
 *
 * @param error - Error from OpenAI API call
 * @returns Structured error information
 */
function handleOpenAIError(error) {
    const errorObj = error;
    console.error('OpenAI API Error Details:', {
        name: errorObj === null || errorObj === void 0 ? void 0 : errorObj.name,
        message: errorObj === null || errorObj === void 0 ? void 0 : errorObj.message,
        status: errorObj === null || errorObj === void 0 ? void 0 : errorObj.status,
        code: errorObj === null || errorObj === void 0 ? void 0 : errorObj.code,
        type: errorObj === null || errorObj === void 0 ? void 0 : errorObj.type,
        cause: errorObj === null || errorObj === void 0 ? void 0 : errorObj.cause
    });
    // Connection/Network errors
    if ((errorObj === null || errorObj === void 0 ? void 0 : errorObj.name) === 'APIConnectionError' || (errorObj === null || errorObj === void 0 ? void 0 : errorObj.code) === 'ECONNRESET' || (errorObj === null || errorObj === void 0 ? void 0 : errorObj.code) === 'ENOTFOUND') {
        return {
            code: 'CONNECTION_ERROR',
            message: 'Network connection to AI service failed. Please try again.',
            details: `Connection error: ${typeof (errorObj === null || errorObj === void 0 ? void 0 : errorObj.message) === 'string' ? errorObj.message : 'Unknown connection error'}`
        };
    }
    // Rate limiting error
    if ((errorObj === null || errorObj === void 0 ? void 0 : errorObj.status) === 429) {
        return {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Analysis temporarily unavailable due to high demand. Please try again in a moment.',
            retryAfter: 60 // seconds
        };
    }
    // Invalid API key or authentication
    if ((errorObj === null || errorObj === void 0 ? void 0 : errorObj.status) === 401 || (errorObj === null || errorObj === void 0 ? void 0 : errorObj.status) === 403) {
        return {
            code: 'API_ERROR',
            message: 'Authentication failed. Please check API configuration.',
            details: `Auth error (${errorObj.status}): ${typeof (errorObj === null || errorObj === void 0 ? void 0 : errorObj.message) === 'string' ? errorObj.message : 'Authentication failed'}`
        };
    }
    // Content too long or invalid
    if ((errorObj === null || errorObj === void 0 ? void 0 : errorObj.status) === 400) {
        return {
            code: 'INVALID_CONTENT',
            message: 'The text content is too long or contains invalid characters. Please check your text and try again.',
            details: (typeof (errorObj === null || errorObj === void 0 ? void 0 : errorObj.message) === 'string' ? errorObj.message : 'Bad request')
        };
    }
    // Network or server errors
    if (typeof (errorObj === null || errorObj === void 0 ? void 0 : errorObj.status) === 'number' && errorObj.status >= 500) {
        return {
            code: 'API_ERROR',
            message: 'AI service is temporarily unavailable. Please try again later.',
            details: `Server error: ${errorObj.status}`
        };
    }
    // Timeout errors
    if ((errorObj === null || errorObj === void 0 ? void 0 : errorObj.name) === 'TimeoutError' || (errorObj === null || errorObj === void 0 ? void 0 : errorObj.code) === 'ETIMEDOUT') {
        return {
            code: 'TIMEOUT_ERROR',
            message: 'Analysis request timed out. Please try again.',
            details: `Timeout: ${typeof (errorObj === null || errorObj === void 0 ? void 0 : errorObj.message) === 'string' ? errorObj.message : 'Request timeout'}`
        };
    }
    // Unknown error
    return {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred during analysis. Please try again.',
        details: (typeof (errorObj === null || errorObj === void 0 ? void 0 : errorObj.message) === 'string' ? errorObj.message : 'Unknown error')
    };
}
/**
 * Calculate content hash for caching purposes
 *
 * @param content - Text content to hash
 * @param options - Analysis options to include in hash
 * @returns Hash string for caching
 */
function calculateContentHash(content, options) {
    const hashInput = JSON.stringify({ content, options });
    return (0, crypto_1.createHash)('sha256').update(hashInput).digest('hex');
}
/**
 * Validate analysis request content and options
 *
 * @param content - Text content to validate
 * @param options - Analysis options to validate
 * @throws {AIAnalysisError} When validation fails
 */
function validateAnalysisRequest(content, options) {
    // Check content length
    if (!content || content.trim().length === 0) {
        throw {
            code: 'INVALID_CONTENT',
            message: 'Text content cannot be empty.',
            details: 'Empty content provided'
        };
    }
    if (content.length > 10000) {
        throw {
            code: 'CONTENT_TOO_LONG',
            message: 'Text content is too long. Please limit to 10,000 characters.',
            details: `Content length: ${content.length} characters`
        };
    }
    // Validate options
    if (!options.includeGrammar && !options.includeStyle && !options.includeReadability) {
        throw {
            code: 'INVALID_CONTENT',
            message: 'At least one analysis type must be enabled.',
            details: 'All analysis options are disabled'
        };
    }
}
//# sourceMappingURL=openai.js.map