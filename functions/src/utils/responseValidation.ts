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

import { 
  GrammarSuggestion, 
  StyleSuggestion, 
  ReadabilitySuggestion,
  ReadabilityMetrics
} from '../types/ai';

/**
 * Simplified parsed response interface
 */
interface ParsedResponse {
  grammarSuggestions: GrammarSuggestion[];
  styleSuggestions: StyleSuggestion[];
  readabilitySuggestions: ReadabilitySuggestion[];
  readabilityMetrics: ReadabilityMetrics;
  parseMetadata?: {
    originalLength: number;
    cleanedLength: number;
    parseAttempts: number;
    warnings: string[];
    fallbacksUsed: string[];
  };
}

/**
 * Simplified response parser optimized for clean GPT-3.5 Turbo responses
 * 
 * @param response - Raw response from OpenAI API
 * @returns Parsed and validated response data
 * 
 * @throws {AIAnalysisError} When response is completely invalid
 */
export function parseAndValidateResponse(response: string): ParsedResponse {
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
    const result: ParsedResponse = {
      grammarSuggestions: extractSuggestions(parsedData.grammarSuggestions, 'grammar') as GrammarSuggestion[],
      styleSuggestions: extractSuggestions(parsedData.styleSuggestions, 'style') as StyleSuggestion[],
      readabilitySuggestions: extractSuggestions(parsedData.readabilitySuggestions, 'readability') as ReadabilitySuggestion[],
      readabilityMetrics: extractReadabilityMetrics(parsedData.readabilityMetrics)
    };
    
    return result;
    
  } catch (error) {
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
function extractSuggestions(
  suggestions: unknown, 
  type: 'grammar' | 'style' | 'readability'
): any[] {
  if (!Array.isArray(suggestions)) {
    return [];
  }
  
  return suggestions
    .filter((item: unknown) => item && typeof item === 'object')
    .slice(0, 20) // Limit suggestions for performance
    .map((item: unknown) => {
      const obj = item as Record<string, unknown>;
      
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
        return {
          ...baseSuggestion,
          grammarRule: String(obj.grammarRule || 'General'),
          eslExplanation: String(obj.eslExplanation || '')
        } as GrammarSuggestion;
      } else if (type === 'style') {
        return {
          ...baseSuggestion,
          styleCategory: validateStyleCategory(obj.styleCategory),
          impact: validateImpact(obj.impact)
        } as StyleSuggestion;
      } else {
        return {
          ...baseSuggestion,
          metric: validateReadabilityMetric(obj.metric),
          targetLevel: String(obj.targetLevel || 'College level')
        } as ReadabilitySuggestion;
      }
    })
    .filter(Boolean) as any[];
}

/**
 * Extract readability metrics with fast validation
 * 
 * @param metrics - Raw metrics object
 * @returns Validated readability metrics
 */
function extractReadabilityMetrics(metrics: unknown): ReadabilityMetrics {
  if (!metrics || typeof metrics !== 'object') {
    return getDefaultReadabilityMetrics();
  }
  
  const obj = metrics as Record<string, unknown>;
  
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
function attemptSimpleRecovery(response: string): ParsedResponse {
  try {
    // Try to extract just the arrays using regex
    const grammarMatch = response.match(/"grammarSuggestions"\s*:\s*(\[[^\]]*\])/);
    const styleMatch = response.match(/"styleSuggestions"\s*:\s*(\[[^\]]*\])/);
    const readabilityMatch = response.match(/"readabilitySuggestions"\s*:\s*(\[[^\]]*\])/);
    
    return {
      grammarSuggestions: grammarMatch ? parseArray(grammarMatch[1], 'grammar') as GrammarSuggestion[] : [],
      styleSuggestions: styleMatch ? parseArray(styleMatch[1], 'style') as StyleSuggestion[] : [],
      readabilitySuggestions: readabilityMatch ? parseArray(readabilityMatch[1], 'readability') as ReadabilitySuggestion[] : [],
      readabilityMetrics: getDefaultReadabilityMetrics()
    };
  } catch (error) {
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
function parseArray(arrayStr: string, type: string): any[] {
  try {
    const parsed = JSON.parse(arrayStr);
    return Array.isArray(parsed) ? extractSuggestions(parsed, type as any) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Fast validation helpers - minimal checking for performance
 */
function validateSeverity(severity: unknown): 'low' | 'medium' | 'high' {
  return ['low', 'medium', 'high'].includes(severity as string) ? severity as any : 'medium';
}

function validateStyleCategory(category: unknown): 'clarity' | 'conciseness' | 'tone' | 'formality' | 'word-choice' {
  return ['clarity', 'conciseness', 'tone', 'formality', 'word-choice'].includes(category as string) 
    ? category as any : 'clarity';
}

function validateImpact(impact: unknown): 'low' | 'medium' | 'high' {
  return ['low', 'medium', 'high'].includes(impact as string) ? impact as any : 'medium';
}

function validateReadabilityMetric(metric: unknown): 'sentence-length' | 'word-complexity' | 'paragraph-structure' | 'transitions' {
  return ['sentence-length', 'word-complexity', 'paragraph-structure', 'transitions'].includes(metric as string)
    ? metric as any : 'sentence-length';
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
 * Simplified recovery parser - just returns basic structure if primary fails
 * 
 * @param response - Raw OpenAI response
 * @returns Parsed response with fallback data if needed
 */
export function parseResponseWithRecovery(response: string): ParsedResponse {
  try {
    return parseAndValidateResponse(response);
  } catch (error) {
    console.warn('[Parser] Parse failed, using empty fallback');
    return {
      grammarSuggestions: [],
      styleSuggestions: [],
      readabilitySuggestions: [],
      readabilityMetrics: getDefaultReadabilityMetrics()
    };
  }
} 
