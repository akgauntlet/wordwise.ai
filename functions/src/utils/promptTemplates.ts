/**
 * @fileoverview Simplified AI prompt templates for fast text analysis
 * @module utils/promptTemplates
 * @author WordWise.ai Team
 * @created 2024-01-XX
 * 
 * Dependencies:
 * - AI analysis types for prompt customization
 * 
 * Usage:
 * - Generate concise prompts for grammar, style, and readability analysis
 * - Optimized for speed while maintaining quality
 * - Support different audience levels and document types
 */

import { AnalysisOptions } from '../types/ai';

/**
 * Simplified base system prompt for faster processing
 */
const BASE_SYSTEM_PROMPT = `You are a writing assistant for ESL students. Analyze text and provide helpful suggestions in JSON format.`;

/**
 * Concise JSON response format template
 */
const RESPONSE_FORMAT_TEMPLATE = `

Return valid JSON only:
{
  "grammarSuggestions": [
    {
      "id": "unique_id",
      "type": "grammar",
      "severity": "low|medium|high",
      "startOffset": 0,
      "endOffset": 5,
      "originalText": "text",
      "suggestedText": "fixed text",
      "explanation": "Brief explanation",
      "category": "grammar",
      "confidence": 0.9
    }
  ],
  "styleSuggestions": [
    {
      "id": "unique_id", 
      "type": "style",
      "severity": "low|medium|high",
      "startOffset": 0,
      "endOffset": 5,
      "originalText": "text",
      "suggestedText": "improved text", 
      "explanation": "Brief explanation",
      "category": "style",
      "confidence": 0.8
    }
  ],
  "readabilitySuggestions": [
    {
      "id": "unique_id",
      "type": "readability", 
      "severity": "low|medium|high",
      "startOffset": 0,
      "endOffset": 5,
      "originalText": "text",
      "suggestedText": "simpler text",
      "explanation": "Brief explanation", 
      "category": "readability",
      "confidence": 0.7
    }
  ],
  "readabilityMetrics": {
    "fleschScore": 50,
    "gradeLevel": 12,
    "avgSentenceLength": 15,
    "avgSyllablesPerWord": 1.5,
    "wordCount": 100,
    "sentenceCount": 5,
    "complexWordsPercent": 15
  }
}

Provide actual suggestions when issues are found. Return empty arrays only if no issues exist.`;

/**
 * Simplified grammar analysis template
 */
const GRAMMAR_ANALYSIS_TEMPLATE = `

Check for:
- Subject-verb agreement
- Article usage (a, an, the)
- Prepositions
- Verb tenses
- Plural/singular forms`;

/**
 * Simplified style analysis template  
 */
const STYLE_ANALYSIS_TEMPLATE = `

Check for:
- Clarity and word choice
- Conciseness (remove wordiness)
- Academic tone
- Sentence variety`;

/**
 * Simplified readability analysis template
 */
const READABILITY_ANALYSIS_TEMPLATE = `

Check for:
- Long sentences (>20 words)
- Complex vocabulary
- Paragraph structure
- Clear transitions`;

/**
 * Generate comprehensive system prompt based on analysis options
 * 
 * @param options - Analysis configuration specifying which types to include
 * @returns Complete system prompt tailored to the requested analysis types
 */
export function generateComprehensiveSystemPrompt(options: AnalysisOptions): string {
  const { includeGrammar, includeStyle, includeReadability, audienceLevel, documentType } = options;
  
  let prompt = BASE_SYSTEM_PROMPT;
  
  // Add brief audience level context
  if (audienceLevel) {
    prompt += ` Focus on ${audienceLevel} level suggestions.`;
  }
  
  // Add brief document type context
  if (documentType && documentType !== 'other') {
    prompt += ` Document type: ${documentType}.`;
  }
  
  // Add specific analysis focuses
  if (includeGrammar) {
    prompt += GRAMMAR_ANALYSIS_TEMPLATE;
  }
  
  if (includeStyle) {
    prompt += STYLE_ANALYSIS_TEMPLATE;
  }
  
  if (includeReadability) {
    prompt += READABILITY_ANALYSIS_TEMPLATE;
  }
  
  // Add response format requirements
  prompt += RESPONSE_FORMAT_TEMPLATE;
  
  return prompt;
}

/**
 * Generate focused grammar prompt for grammar-only analysis
 * 
 * @param audienceLevel - Student proficiency level
 * @param documentType - Type of document being analyzed
 * @returns Grammar-focused system prompt
 */
export function generateGrammarPrompt(
  audienceLevel?: string, 
  documentType?: string
): string {
  let prompt = BASE_SYSTEM_PROMPT;
  
  if (audienceLevel) {
    prompt += ` Focus on ${audienceLevel} level grammar.`;
  }
  
  if (documentType && documentType !== 'other') {
    prompt += ` Document: ${documentType}.`;
  }
  
  prompt += GRAMMAR_ANALYSIS_TEMPLATE;
  prompt += RESPONSE_FORMAT_TEMPLATE;
  
  return prompt;
}

/**
 * Generate focused style prompt for style-only analysis
 * 
 * @param audienceLevel - Student proficiency level
 * @param documentType - Type of document being analyzed
 * @returns Style-focused system prompt
 */
export function generateStylePrompt(
  audienceLevel?: string, 
  documentType?: string
): string {
  let prompt = BASE_SYSTEM_PROMPT;
  
  if (audienceLevel) {
    prompt += ` Focus on ${audienceLevel} level style.`;
  }
  
  if (documentType && documentType !== 'other') {
    prompt += ` Document: ${documentType}.`;
  }
  
  prompt += STYLE_ANALYSIS_TEMPLATE;
  prompt += RESPONSE_FORMAT_TEMPLATE;
  
  return prompt;
}

/**
 * Generate focused readability prompt for readability-only analysis
 * 
 * @param audienceLevel - Student proficiency level
 * @param documentType - Type of document being analyzed
 * @returns Readability-focused system prompt
 */
export function generateReadabilityPrompt(
  audienceLevel?: string, 
  documentType?: string
): string {
  let prompt = BASE_SYSTEM_PROMPT;
  
  if (audienceLevel) {
    prompt += ` Focus on ${audienceLevel} level readability.`;
  }
  
  if (documentType && documentType !== 'other') {
    prompt += ` Document: ${documentType}.`;
  }
  
  prompt += READABILITY_ANALYSIS_TEMPLATE;
  prompt += RESPONSE_FORMAT_TEMPLATE;
  
  return prompt;
}

/**
 * Generate simplified user prompt
 * 
 * @param content - Text content to analyze
 * @param specificInstructions - Any additional specific instructions
 * @returns Formatted user prompt
 */
export function generateUserPrompt(
  content: string, 
  specificInstructions?: string
): string {
  let prompt = `Analyze this text:\n\n"${content}"`;
  
  if (specificInstructions) {
    prompt += `\n\n${specificInstructions}`;
  }
  
  prompt += `\n\nReturn JSON only with accurate character positions.`;
  
  return prompt;
}

// Simplified lightweight prompts for real-time analysis
export function generateLightweightSystemPrompt(options: AnalysisOptions): string {
  let prompt = `You are a writing assistant for ESL students. Perform quick text analysis and provide helpful suggestions.`;
  
  const checks = [];
  if (options.includeGrammar) checks.push('grammar');
  if (options.includeStyle) checks.push('style'); 
  if (options.includeReadability) checks.push('readability');
  
  if (checks.length > 0) {
    prompt += ` Analyze for: ${checks.join(', ')}.`;
  }
  
  prompt += `

Find actual issues in the text and provide specific suggestions. Return JSON format:

{
  "grammarSuggestions": [
    {
      "id": "1",
      "type": "grammar", 
      "severity": "medium",
      "startOffset": 0,
      "endOffset": 4,
      "originalText": "This",
      "suggestedText": "These",
      "explanation": "Subject-verb agreement: use 'These' with plural nouns",
      "category": "grammar",
      "confidence": 0.9
    }
  ],
  "styleSuggestions": [
    {
      "id": "2",
      "type": "style",
      "severity": "low", 
      "startOffset": 10,
      "endOffset": 20,
      "originalText": "very good",
      "suggestedText": "excellent",
      "explanation": "Use more precise vocabulary",
      "category": "style",
      "confidence": 0.8
    }
  ],
  "readabilitySuggestions": [
    {
      "id": "3",
      "type": "readability",
      "severity": "low",
      "startOffset": 25,
      "endOffset": 50,
      "originalText": "extremely complicated sentence",
      "suggestedText": "complex sentence", 
      "explanation": "Simplify word choice for better readability",
      "category": "readability",
      "confidence": 0.7
    }
  ],
  "readabilityMetrics": {
    "fleschScore": 65,
    "gradeLevel": 8,
    "avgSentenceLength": 12,
    "avgSyllablesPerWord": 1.4,
    "wordCount": 25,
    "sentenceCount": 2,
    "complexWordsPercent": 10
  }
}

Return up to 5 suggestions per category. If no issues found, return empty arrays.`;
  
  return prompt;
}

export function generateLightweightUserPrompt(content: string): string {
  return `Quick analysis:\n\n"${content}"\n\nJSON only.`;
}

// Keep minimal compatibility exports for existing code
export const ESL_GRAMMAR_PATTERNS = {
  articles: { rules: [], commonErrors: [] },
  prepositions: { timePrepositions: {} as object, placePrepositions: {} as object },
  subjectVerbAgreement: { rules: [] }
};

export const ACADEMIC_STYLE_GUIDELINES = {
  formalityMarkers: { avoid: [], prefer: [] }
};

export const READABILITY_TARGETS = {
  collegeLevel: { fleschScore: [40, 60] }
}; 
