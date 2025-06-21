"use strict";
/**
 * @fileoverview Simplified response parsing utilities for AI analysis
 * @module utils/responseValidation
 * @author WordWise.ai Team
 * @created 2024-01-XX
 *
 * Dependencies:
 * - AI types for validation schemas
 *
 * Usage:
 * - Fast parsing of OpenAI API responses
 * - Basic validation with minimal overhead
 * - Optimized for simplified prompts and reliable GPT-3.5 Turbo responses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAndValidateResponse = parseAndValidateResponse;
exports.parseResponseWithRecovery = parseResponseWithRecovery;
/**
 * Simplified response parser optimized for clean GPT-3.5 Turbo responses
 *
 * @param response - Raw response from OpenAI API
 * @returns Parsed and validated response data
 *
 * @throws {AIAnalysisError} When response is completely invalid
 */
function parseAndValidateResponse(response) {
    try {
        // Simple cleanup - remove markdown and trim
        let cleanedResponse = response.trim();
        // Remove markdown code blocks if present
        cleanedResponse = cleanedResponse.replace(/```json\s*/gi, '');
        cleanedResponse = cleanedResponse.replace(/```\s*$/gi, '');
        // Find JSON object boundaries
        const jsonStart = cleanedResponse.indexOf('{');
        const jsonEnd = cleanedResponse.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
        }
        // Parse JSON directly - trust the simplified prompts
        const parsedData = JSON.parse(cleanedResponse);
        // Fast extraction with minimal validation
        const result = {
            grammarSuggestions: extractSuggestions(parsedData.grammarSuggestions, 'grammar'),
            styleSuggestions: extractSuggestions(parsedData.styleSuggestions, 'style'),
            readabilitySuggestions: extractSuggestions(parsedData.readabilitySuggestions, 'readability'),
            readabilityMetrics: extractReadabilityMetrics(parsedData.readabilityMetrics)
        };
        return result;
    }
    catch (error) {
        // Simple fallback - try one recovery method
        console.warn('[Parser] Primary parse failed, attempting simple recovery');
        return attemptSimpleRecovery(response);
    }
}
/**
 * Extract and validate suggestions with minimal overhead
 *
 * @param suggestions - Raw suggestions array
 * @param type - Suggestion type for validation
 * @returns Validated suggestions array
 */
function extractSuggestions(suggestions, type) {
    if (!Array.isArray(suggestions)) {
        return [];
    }
    return suggestions
        .filter((item) => item && typeof item === 'object')
        .slice(0, 20) // Limit suggestions for performance
        .map((item) => {
        const obj = item;
        // Fast validation - only check essential fields
        if (!obj.id || !obj.originalText || !obj.suggestedText) {
            return null;
        }
        const baseSuggestion = {
            id: String(obj.id),
            type,
            severity: validateSeverity(obj.severity),
            startOffset: Math.max(0, parseInt(String(obj.startOffset)) || 0),
            endOffset: Math.max(0, parseInt(String(obj.endOffset)) || 0),
            originalText: String(obj.originalText),
            suggestedText: String(obj.suggestedText),
            explanation: String(obj.explanation || 'Improvement suggested'),
            category: String(obj.category || 'general'),
            confidence: Math.min(1, Math.max(0, parseFloat(String(obj.confidence)) || 0.8))
        };
        // Add type-specific fields with minimal validation
        if (type === 'grammar') {
            return Object.assign(Object.assign({}, baseSuggestion), { grammarRule: String(obj.grammarRule || 'General'), eslExplanation: String(obj.eslExplanation || '') });
        }
        else if (type === 'style') {
            return Object.assign(Object.assign({}, baseSuggestion), { styleCategory: validateStyleCategory(obj.styleCategory), impact: validateImpact(obj.impact) });
        }
        else {
            return Object.assign(Object.assign({}, baseSuggestion), { metric: validateReadabilityMetric(obj.metric), targetLevel: String(obj.targetLevel || 'College level') });
        }
    })
        .filter(Boolean);
}
/**
 * Extract readability metrics with fast validation
 *
 * @param metrics - Raw metrics object
 * @returns Validated readability metrics
 */
function extractReadabilityMetrics(metrics) {
    if (!metrics || typeof metrics !== 'object') {
        return getDefaultReadabilityMetrics();
    }
    const obj = metrics;
    return {
        fleschScore: Math.max(0, Math.min(100, parseFloat(String(obj.fleschScore)) || 50)),
        gradeLevel: Math.max(0, Math.min(20, parseFloat(String(obj.gradeLevel)) || 12)),
        avgSentenceLength: Math.max(0, parseFloat(String(obj.avgSentenceLength)) || 15),
        avgSyllablesPerWord: Math.max(1, parseFloat(String(obj.avgSyllablesPerWord)) || 1.5),
        wordCount: Math.max(0, parseInt(String(obj.wordCount)) || 0),
        sentenceCount: Math.max(0, parseInt(String(obj.sentenceCount)) || 0),
        complexWordsPercent: Math.max(0, Math.min(100, parseFloat(String(obj.complexWordsPercent)) || 15))
    };
}
/**
 * Simple recovery attempt for malformed responses
 *
 * @param response - Original response
 * @returns Parsed response or empty structure
 */
function attemptSimpleRecovery(response) {
    try {
        // Try to extract just the arrays using regex
        const grammarMatch = response.match(/"grammarSuggestions"\s*:\s*(\[[^\]]*\])/);
        const styleMatch = response.match(/"styleSuggestions"\s*:\s*(\[[^\]]*\])/);
        const readabilityMatch = response.match(/"readabilitySuggestions"\s*:\s*(\[[^\]]*\])/);
        return {
            grammarSuggestions: grammarMatch ? parseArray(grammarMatch[1], 'grammar') : [],
            styleSuggestions: styleMatch ? parseArray(styleMatch[1], 'style') : [],
            readabilitySuggestions: readabilityMatch ? parseArray(readabilityMatch[1], 'readability') : [],
            readabilityMetrics: getDefaultReadabilityMetrics()
        };
    }
    catch (error) {
        console.error('[Parser] Recovery failed, returning empty response');
        return {
            grammarSuggestions: [],
            styleSuggestions: [],
            readabilitySuggestions: [],
            readabilityMetrics: getDefaultReadabilityMetrics()
        };
    }
}
/**
 * Parse a JSON array with error handling
 *
 * @param arrayStr - JSON array string
 * @param type - Suggestion type
 * @returns Parsed suggestions
 */
function parseArray(arrayStr, type) {
    try {
        const parsed = JSON.parse(arrayStr);
        return Array.isArray(parsed) ? extractSuggestions(parsed, type) : [];
    }
    catch (error) {
        return [];
    }
}
/**
 * Fast validation helpers - minimal checking for performance
 */
function validateSeverity(severity) {
    return ['low', 'medium', 'high'].includes(severity) ? severity : 'medium';
}
function validateStyleCategory(category) {
    return ['clarity', 'conciseness', 'tone', 'formality', 'word-choice'].includes(category)
        ? category : 'clarity';
}
function validateImpact(impact) {
    return ['low', 'medium', 'high'].includes(impact) ? impact : 'medium';
}
function validateReadabilityMetric(metric) {
    return ['sentence-length', 'word-complexity', 'paragraph-structure', 'transitions'].includes(metric)
        ? metric : 'sentence-length';
}
function getDefaultReadabilityMetrics() {
    return {
        fleschScore: 50,
        gradeLevel: 12,
        avgSentenceLength: 15,
        avgSyllablesPerWord: 1.5,
        wordCount: 0,
        sentenceCount: 0,
        complexWordsPercent: 15
    };
}
/**
 * Simplified recovery parser - just returns basic structure if primary fails
 *
 * @param response - Raw OpenAI response
 * @returns Parsed response with fallback data if needed
 */
function parseResponseWithRecovery(response) {
    try {
        return parseAndValidateResponse(response);
    }
    catch (error) {
        console.warn('[Parser] Parse failed, using empty fallback');
        return {
            grammarSuggestions: [],
            styleSuggestions: [],
            readabilitySuggestions: [],
            readabilityMetrics: getDefaultReadabilityMetrics()
        };
    }
}
//# sourceMappingURL=responseValidation.js.map