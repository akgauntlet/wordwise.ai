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
 * Generate comprehensive system prompt based on analysis options
 *
 * @param options - Analysis configuration specifying which types to include
 * @returns Complete system prompt tailored to the requested analysis types
 */
export declare function generateComprehensiveSystemPrompt(options: AnalysisOptions): string;
/**
 * Generate focused grammar prompt for grammar-only analysis
 *
 * @param audienceLevel - Student proficiency level
 * @param documentType - Type of document being analyzed
 * @returns Grammar-focused system prompt
 */
export declare function generateGrammarPrompt(audienceLevel?: string, documentType?: string): string;
/**
 * Generate focused style prompt for style-only analysis
 *
 * @param audienceLevel - Student proficiency level
 * @param documentType - Type of document being analyzed
 * @returns Style-focused system prompt
 */
export declare function generateStylePrompt(audienceLevel?: string, documentType?: string): string;
/**
 * Generate focused readability prompt for readability-only analysis
 *
 * @param audienceLevel - Student proficiency level
 * @param documentType - Type of document being analyzed
 * @returns Readability-focused system prompt
 */
export declare function generateReadabilityPrompt(audienceLevel?: string, documentType?: string): string;
/**
 * Generate simplified user prompt
 *
 * @param content - Text content to analyze
 * @param specificInstructions - Any additional specific instructions
 * @returns Formatted user prompt
 */
export declare function generateUserPrompt(content: string, specificInstructions?: string): string;
export declare function generateLightweightSystemPrompt(options: AnalysisOptions): string;
export declare function generateLightweightUserPrompt(content: string): string;
export declare const ESL_GRAMMAR_PATTERNS: {
    articles: {
        rules: never[];
        commonErrors: never[];
    };
    prepositions: {
        timePrepositions: {};
        placePrepositions: {};
    };
    subjectVerbAgreement: {
        rules: never[];
    };
};
export declare const ACADEMIC_STYLE_GUIDELINES: {
    formalityMarkers: {
        avoid: never[];
        prefer: never[];
    };
};
export declare const READABILITY_TARGETS: {
    collegeLevel: {
        fleschScore: number[];
    };
};
//# sourceMappingURL=promptTemplates.d.ts.map