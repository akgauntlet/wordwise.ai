/**
 * @fileoverview Response validation and parsing utilities for AI analysis
 * @module utils/responseValidation
 * @author WordWise.ai Team
 * @created 2024-01-XX
 * 
 * Dependencies:
 * - AI types for validation schemas
 * - Logging utilities for error tracking
 * 
 * Usage:
 * - Validate OpenAI API responses against expected schemas
 * - Parse and sanitize AI-generated suggestions
 * - Handle malformed or incomplete responses gracefully
 * - Provide fallback mechanisms for partial data
 */

import { 
  GrammarSuggestion, 
  StyleSuggestion, 
  ReadabilitySuggestion,
  ReadabilityMetrics,
  AIAnalysisError,
  AnalysisOptions
} from '../types/ai';

/**
 * Parsed response interface with metadata
 */
interface ParsedResponse {
  grammarSuggestions: GrammarSuggestion[];
  styleSuggestions: StyleSuggestion[];
  readabilitySuggestions: ReadabilitySuggestion[];
  readabilityMetrics: ReadabilityMetrics;
  parseMetadata: {
    originalLength: number;
    cleanedLength: number;
    parseAttempts: number;
    warnings: string[];
    fallbacksUsed: string[];
  };
}

/**
 * Response parsing configuration
 */
interface ParseConfig {
  /** Maximum allowed suggestions per category */
  maxSuggestionsPerCategory: number;
  /** Whether to attempt fallback parsing for malformed JSON */
  enableFallbackParsing: boolean;
  /** Whether to validate suggestion content */
  validateSuggestionContent: boolean;
  /** Minimum confidence threshold for suggestions */
  minConfidenceThreshold: number;
}

/**
 * Default parsing configuration
 */
const DEFAULT_PARSE_CONFIG: ParseConfig = {
  maxSuggestionsPerCategory: 50,
  enableFallbackParsing: true,
  validateSuggestionContent: true,
  minConfidenceThreshold: 0.1
};

/**
 * Enhanced response parser with comprehensive error handling and validation
 * 
 * @param response - Raw response from OpenAI API
 * @param config - Parsing configuration options
 * @returns Parsed and validated response data
 * 
 * @throws {AIAnalysisError} When response is completely invalid
 */
export function parseAndValidateResponse(
  response: string,
  config: ParseConfig = DEFAULT_PARSE_CONFIG
): ParsedResponse {
  const parseMetadata = {
    originalLength: response.length,
    cleanedLength: 0,
    parseAttempts: 0,
    warnings: [],
    fallbacksUsed: []
  };

  console.log(`[ResponseParser] Starting parse of ${response.length} character response`);
  
  // Step 1: Clean and prepare response
  const cleanedResponse = cleanResponse(response);
  parseMetadata.cleanedLength = cleanedResponse.length;
  parseMetadata.parseAttempts++;

  // Step 2: Attempt primary JSON parsing
  let parsedData: any;
  try {
    parsedData = JSON.parse(cleanedResponse);
    console.log('[ResponseParser] Primary JSON parse successful');
  } catch (error) {
    console.warn('[ResponseParser] Primary JSON parse failed, attempting fallback parsing');
    
    if (config.enableFallbackParsing) {
      parsedData = attemptFallbackParsing(cleanedResponse, parseMetadata);
      parseMetadata.parseAttempts++;
    } else {
      throw createParseError('JSON parsing failed and fallback parsing disabled', error);
    }
  }

  // Step 3: Validate and extract suggestions
  const validatedData = validateAndExtractSuggestions(parsedData, config, parseMetadata);

  // Step 4: Validate readability metrics
  const readabilityMetrics = validateReadabilityMetrics(
    parsedData.readabilityMetrics, 
    parseMetadata
  );

  console.log(`[ResponseParser] Parse completed with ${parseMetadata.warnings.length} warnings`);

  return {
    grammarSuggestions: validatedData.grammarSuggestions,
    styleSuggestions: validatedData.styleSuggestions,
    readabilitySuggestions: validatedData.readabilitySuggestions,
    readabilityMetrics,
    parseMetadata
  };
}

/**
 * Clean response text by removing markdown formatting and fixing common issues
 * 
 * @param response - Raw response text
 * @returns Cleaned response text
 */
function cleanResponse(response: string): string {
  let cleaned = response.trim();
  
  // Remove markdown code block formatting
  cleaned = cleaned.replace(/```json\s*/gi, '');
  cleaned = cleaned.replace(/```\s*$/gi, '');
  
  // Remove any leading/trailing text that isn't JSON
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }
  
  // Fix common JSON formatting issues
  cleaned = cleaned.replace(/,\s*}/g, '}'); // Remove trailing commas
  cleaned = cleaned.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
  
  return cleaned;
}

/**
 * Attempt fallback parsing for malformed JSON responses
 * 
 * @param response - Cleaned response text
 * @param metadata - Parse metadata for tracking
 * @returns Parsed data object or throws error
 */
function attemptFallbackParsing(response: string, metadata: any): any {
  const fallbackAttempts = [
    // Attempt 1: Extract individual suggestion arrays
    () => extractSuggestionArrays(response),
    // Attempt 2: Parse partial JSON objects
    () => parsePartialJson(response),
    // Attempt 3: Extract text-based suggestions
    () => extractTextBasedSuggestions(response)
  ];

  for (let i = 0; i < fallbackAttempts.length; i++) {
    try {
      console.log(`[ResponseParser] Attempting fallback method ${i + 1}`);
      const result = fallbackAttempts[i]();
      metadata.fallbacksUsed.push(`Fallback method ${i + 1}`);
      metadata.warnings.push(`Used fallback parsing method ${i + 1}`);
      return result;
    } catch (error) {
      console.warn(`[ResponseParser] Fallback method ${i + 1} failed:`, error);
    }
  }

  throw createParseError('All fallback parsing methods failed', new Error('Complete parse failure'));
}

/**
 * Extract suggestion arrays from response using regex patterns
 * 
 * @param response - Response text
 * @returns Structured data object
 */
function extractSuggestionArrays(response: string): any {
  const result = {
    grammarSuggestions: [],
    styleSuggestions: [],
    readabilitySuggestions: [],
    readabilityMetrics: getDefaultReadabilityMetrics()
  };

  // Extract grammar suggestions
  const grammarMatch = response.match(/"grammarSuggestions"\s*:\s*(\[[^\]]*\])/);
  if (grammarMatch) {
    try {
      result.grammarSuggestions = JSON.parse(grammarMatch[1]);
    } catch (error) {
      console.warn('[ResponseParser] Failed to parse grammar suggestions array');
    }
  }

  // Extract style suggestions
  const styleMatch = response.match(/"styleSuggestions"\s*:\s*(\[[^\]]*\])/);
  if (styleMatch) {
    try {
      result.styleSuggestions = JSON.parse(styleMatch[1]);
    } catch (error) {
      console.warn('[ResponseParser] Failed to parse style suggestions array');
    }
  }

  // Extract readability suggestions
  const readabilityMatch = response.match(/"readabilitySuggestions"\s*:\s*(\[[^\]]*\])/);
  if (readabilityMatch) {
    try {
      result.readabilitySuggestions = JSON.parse(readabilityMatch[1]);
    } catch (error) {
      console.warn('[ResponseParser] Failed to parse readability suggestions array');
    }
  }

  return result;
}

/**
 * Parse partial JSON by attempting to reconstruct valid JSON
 * 
 * @param response - Response text
 * @returns Partial data object
 */
function parsePartialJson(response: string): any {
  // Try to find the largest valid JSON object
  const braceCount = (response.match(/{/g) || []).length;
  const closeBraceCount = (response.match(/}/g) || []).length;
  
  // Add missing closing braces
  let fixedResponse = response;
  for (let i = 0; i < braceCount - closeBraceCount; i++) {
    fixedResponse += '}';
  }
  
  try {
    return JSON.parse(fixedResponse);
  } catch (error) {
    // Try removing incomplete trailing content
    const lastComma = fixedResponse.lastIndexOf(',');
    if (lastComma > 0) {
      const truncated = fixedResponse.substring(0, lastComma) + '}';
      return JSON.parse(truncated);
    }
    throw error;
  }
}

/**
 * Extract suggestions from text-based response format
 * 
 * @param response - Response text
 * @returns Basic data structure with extracted suggestions
 */
function extractTextBasedSuggestions(response: string): any {
  // This is a last resort - extract any structured information
  const result = {
    grammarSuggestions: [],
    styleSuggestions: [],
    readabilitySuggestions: [],
    readabilityMetrics: getDefaultReadabilityMetrics()
  };

  // This would be a very basic extraction - mainly to prevent complete failure
  console.warn('[ResponseParser] Using text-based extraction as last resort');
  
  return result;
}

/**
 * Validate and extract suggestions with content validation
 * 
 * @param data - Parsed data object
 * @param config - Parsing configuration
 * @param metadata - Parse metadata
 * @returns Validated suggestions
 */
function validateAndExtractSuggestions(
  data: any, 
  config: ParseConfig, 
  metadata: any
): {
  grammarSuggestions: GrammarSuggestion[];
  styleSuggestions: StyleSuggestion[];
  readabilitySuggestions: ReadabilitySuggestion[];
} {
  const result = {
    grammarSuggestions: [],
    styleSuggestions: [],
    readabilitySuggestions: []
  };

  // Validate grammar suggestions
  if (Array.isArray(data.grammarSuggestions)) {
    result.grammarSuggestions = data.grammarSuggestions
      .map((suggestion: any) => validateGrammarSuggestion(suggestion, config, metadata))
      .filter((suggestion: GrammarSuggestion | null): suggestion is GrammarSuggestion => 
        suggestion !== null
      )
      .slice(0, config.maxSuggestionsPerCategory);
  } else {
    metadata.warnings.push('Grammar suggestions not found or invalid format');
  }

  // Validate style suggestions  
  if (Array.isArray(data.styleSuggestions)) {
    result.styleSuggestions = data.styleSuggestions
      .map((suggestion: any) => validateStyleSuggestion(suggestion, config, metadata))
      .filter((suggestion: StyleSuggestion | null): suggestion is StyleSuggestion => 
        suggestion !== null
      )
      .slice(0, config.maxSuggestionsPerCategory);
  } else {
    metadata.warnings.push('Style suggestions not found or invalid format');
  }

  // Validate readability suggestions
  if (Array.isArray(data.readabilitySuggestions)) {
    result.readabilitySuggestions = data.readabilitySuggestions
      .map((suggestion: any) => validateReadabilitySuggestion(suggestion, config, metadata))
      .filter((suggestion: ReadabilitySuggestion | null): suggestion is ReadabilitySuggestion => 
        suggestion !== null
      )
      .slice(0, config.maxSuggestionsPerCategory);
  } else {
    metadata.warnings.push('Readability suggestions not found or invalid format');
  }

  console.log(`[ResponseParser] Validated ${result.grammarSuggestions.length} grammar, ${result.styleSuggestions.length} style, ${result.readabilitySuggestions.length} readability suggestions`);

  return result;
}

/**
 * Validate individual grammar suggestion
 * 
 * @param suggestion - Raw suggestion data
 * @param config - Parse configuration
 * @param metadata - Parse metadata
 * @returns Validated grammar suggestion or null if invalid
 */
function validateGrammarSuggestion(
  suggestion: any, 
  config: ParseConfig, 
  metadata: any
): GrammarSuggestion | null {
  try {
    // Required fields validation
    if (!suggestion.id || !suggestion.originalText || !suggestion.suggestedText) {
      metadata.warnings.push('Grammar suggestion missing required fields');
      return null;
    }

    // Confidence threshold check
    const confidence = typeof suggestion.confidence === 'number' ? suggestion.confidence : 0.5;
    if (confidence < config.minConfidenceThreshold) {
      metadata.warnings.push(`Grammar suggestion confidence too low: ${confidence}`);
      return null;
    }

    // Text position validation
    const startOffset = Math.max(0, parseInt(suggestion.startOffset) || 0);
    const endOffset = Math.max(startOffset, parseInt(suggestion.endOffset) || startOffset);

    return {
      id: String(suggestion.id),
      type: 'grammar',
      severity: validateSeverity(suggestion.severity),
      startOffset,
      endOffset,
      originalText: String(suggestion.originalText),
      suggestedText: String(suggestion.suggestedText),
      explanation: String(suggestion.explanation || 'Grammar correction suggested'),
      category: String(suggestion.category || 'general'),
      confidence,
      grammarRule: String(suggestion.grammarRule || 'General Grammar'),
      eslExplanation: String(suggestion.eslExplanation || '')
    };
  } catch (error) {
    metadata.warnings.push(`Failed to validate grammar suggestion: ${error}`);
    return null;
  }
}

/**
 * Validate individual style suggestion
 * 
 * @param suggestion - Raw suggestion data
 * @param config - Parse configuration
 * @param metadata - Parse metadata
 * @returns Validated style suggestion or null if invalid
 */
function validateStyleSuggestion(
  suggestion: any, 
  config: ParseConfig, 
  metadata: any
): StyleSuggestion | null {
  try {
    // Required fields validation
    if (!suggestion.id || !suggestion.originalText || !suggestion.suggestedText) {
      metadata.warnings.push('Style suggestion missing required fields');
      return null;
    }

    // Confidence threshold check
    const confidence = typeof suggestion.confidence === 'number' ? suggestion.confidence : 0.5;
    if (confidence < config.minConfidenceThreshold) {
      metadata.warnings.push(`Style suggestion confidence too low: ${confidence}`);
      return null;
    }

    // Text position validation
    const startOffset = Math.max(0, parseInt(suggestion.startOffset) || 0);
    const endOffset = Math.max(startOffset, parseInt(suggestion.endOffset) || startOffset);

    return {
      id: String(suggestion.id),
      type: 'style',
      severity: validateSeverity(suggestion.severity),
      startOffset,
      endOffset,
      originalText: String(suggestion.originalText),
      suggestedText: String(suggestion.suggestedText),
      explanation: String(suggestion.explanation || 'Style improvement suggested'),
      category: String(suggestion.category || 'general'),
      confidence,
      styleCategory: validateStyleCategory(suggestion.styleCategory),
      impact: validateImpact(suggestion.impact)
    };
  } catch (error) {
    metadata.warnings.push(`Failed to validate style suggestion: ${error}`);
    return null;
  }
}

/**
 * Validate individual readability suggestion
 * 
 * @param suggestion - Raw suggestion data
 * @param config - Parse configuration
 * @param metadata - Parse metadata
 * @returns Validated readability suggestion or null if invalid
 */
function validateReadabilitySuggestion(
  suggestion: any, 
  config: ParseConfig, 
  metadata: any
): ReadabilitySuggestion | null {
  try {
    // Required fields validation
    if (!suggestion.id || !suggestion.originalText || !suggestion.suggestedText) {
      metadata.warnings.push('Readability suggestion missing required fields');
      return null;
    }

    // Confidence threshold check
    const confidence = typeof suggestion.confidence === 'number' ? suggestion.confidence : 0.5;
    if (confidence < config.minConfidenceThreshold) {
      metadata.warnings.push(`Readability suggestion confidence too low: ${confidence}`);
      return null;
    }

    // Text position validation
    const startOffset = Math.max(0, parseInt(suggestion.startOffset) || 0);
    const endOffset = Math.max(startOffset, parseInt(suggestion.endOffset) || startOffset);

    return {
      id: String(suggestion.id),
      type: 'readability',
      severity: validateSeverity(suggestion.severity),
      startOffset,
      endOffset,
      originalText: String(suggestion.originalText),
      suggestedText: String(suggestion.suggestedText),
      explanation: String(suggestion.explanation || 'Readability improvement suggested'),
      category: String(suggestion.category || 'general'),
      confidence,
      metric: validateReadabilityMetric(suggestion.metric),
      targetLevel: String(suggestion.targetLevel || 'College level')
    };
  } catch (error) {
    metadata.warnings.push(`Failed to validate readability suggestion: ${error}`);
    return null;
  }
}

/**
 * Validate and normalize readability metrics
 * 
 * @param metrics - Raw metrics data
 * @param metadata - Parse metadata
 * @returns Validated readability metrics
 */
function validateReadabilityMetrics(metrics: any, metadata: any): ReadabilityMetrics {
  if (!metrics || typeof metrics !== 'object') {
    metadata.warnings.push('Readability metrics missing or invalid, using defaults');
    return getDefaultReadabilityMetrics();
  }

  try {
    return {
      fleschScore: Math.max(0, Math.min(100, parseFloat(metrics.fleschScore) || 50)),
      gradeLevel: Math.max(0, Math.min(20, parseFloat(metrics.gradeLevel) || 12)),
      avgSentenceLength: Math.max(0, parseFloat(metrics.avgSentenceLength) || 15),
      avgSyllablesPerWord: Math.max(1, parseFloat(metrics.avgSyllablesPerWord) || 1.5),
      wordCount: Math.max(0, parseInt(metrics.wordCount) || 0),
      sentenceCount: Math.max(0, parseInt(metrics.sentenceCount) || 0),
      complexWordsPercent: Math.max(0, Math.min(100, parseFloat(metrics.complexWordsPercent) || 15))
    };
  } catch (error) {
    metadata.warnings.push(`Failed to validate readability metrics: ${error}`);
    return getDefaultReadabilityMetrics();
  }
}

/**
 * Helper functions for validation
 */
function validateSeverity(severity: any): 'low' | 'medium' | 'high' {
  if (['low', 'medium', 'high'].includes(severity)) {
    return severity;
  }
  return 'medium';
}

function validateStyleCategory(category: any): 'clarity' | 'conciseness' | 'tone' | 'formality' | 'word-choice' {
  if (['clarity', 'conciseness', 'tone', 'formality', 'word-choice'].includes(category)) {
    return category;
  }
  return 'clarity';
}

function validateImpact(impact: any): 'low' | 'medium' | 'high' {
  if (['low', 'medium', 'high'].includes(impact)) {
    return impact;
  }
  return 'medium';
}

function validateReadabilityMetric(metric: any): 'sentence-length' | 'word-complexity' | 'paragraph-structure' | 'transitions' {
  if (['sentence-length', 'word-complexity', 'paragraph-structure', 'transitions'].includes(metric)) {
    return metric;
  }
  return 'sentence-length';
}

function getDefaultReadabilityMetrics(): ReadabilityMetrics {
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
 * Create standardized parse error
 * 
 * @param message - Error message
 * @param originalError - Original error object
 * @returns Formatted AI analysis error
 */
function createParseError(message: string, originalError: any): AIAnalysisError {
  return {
    code: 'API_ERROR',
    message: 'Failed to parse AI analysis response',
    details: `${message}: ${originalError?.message || 'Unknown error'}`
  };
}

/**
 * Enhanced response parser with comprehensive recovery mechanisms
 * 
 * @param response - Raw OpenAI response
 * @param options - Original analysis options for context
 * @returns Parsed response with fallback data if needed
 */
export function parseResponseWithRecovery(
  response: string,
  options: AnalysisOptions
): ParsedResponse {
  try {
    return parseAndValidateResponse(response);
  } catch (error) {
    console.error('[ResponseParser] Complete parse failure, using emergency fallback');
    
    // Emergency fallback - return empty but valid structure
    return {
      grammarSuggestions: [],
      styleSuggestions: [],
      readabilitySuggestions: [],
      readabilityMetrics: getDefaultReadabilityMetrics(),
      parseMetadata: {
        originalLength: response.length,
        cleanedLength: 0,
        parseAttempts: 1,
        warnings: ['Complete parse failure - using emergency fallback'],
        fallbacksUsed: ['Emergency empty response']
      }
    };
  }
} 
