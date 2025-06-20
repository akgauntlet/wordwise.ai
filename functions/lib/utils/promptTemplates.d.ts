/**
 * @fileoverview Specialized AI prompt templates for comprehensive text analysis
 * @module utils/promptTemplates
 * @author WordWise.ai Team
 * @created 2024-01-XX
 *
 * Dependencies:
 * - AI analysis types for prompt customization
 *
 * Usage:
 * - Generate specialized prompts for grammar, style, and readability analysis
 * - Provide ESL-specific guidance and educational content
 * - Support different audience levels and document types
 * - Ensure consistent AI response format across all analysis types
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
 * Generate user prompt that presents the text for analysis
 *
 * @param content - Text content to analyze
 * @param specificInstructions - Any additional specific instructions
 * @returns Formatted user prompt
 */
export declare function generateUserPrompt(content: string, specificInstructions?: string): string;
/**
 * ESL-specific grammar rules and common error patterns
 */
export declare const ESL_GRAMMAR_PATTERNS: {
    articles: {
        rules: string[];
        commonErrors: {
            pattern: RegExp;
            rule: string;
        }[];
    };
    prepositions: {
        timePrepositions: {
            in: string[];
            on: string[];
            at: string[];
        };
        placePrepositions: {
            in: string[];
            on: string[];
            at: string[];
        };
    };
    subjectVerbAgreement: {
        rules: string[];
    };
};
/**
 * Academic writing style guidelines for ESL students
 */
export declare const ACADEMIC_STYLE_GUIDELINES: {
    formalityMarkers: {
        avoid: string[];
        prefer: string[];
    };
    transitionWords: {
        addition: string[];
        contrast: string[];
        cause: string[];
        sequence: string[];
    };
    wordChoice: {
        precision: string;
        sophistication: string;
        consistency: string;
    };
};
/**
 * Readability benchmarks and targets for different text types
 */
export declare const READABILITY_TARGETS: {
    collegeLevel: {
        fleschScore: {
            min: number;
            ideal: number;
            max: number;
        };
        gradeLevel: {
            min: number;
            ideal: number;
            max: number;
        };
        avgSentenceLength: {
            min: number;
            ideal: number;
            max: number;
        };
        complexWordsPercent: {
            min: number;
            ideal: number;
            max: number;
        };
    };
    eslFriendly: {
        fleschScore: {
            min: number;
            ideal: number;
            max: number;
        };
        gradeLevel: {
            min: number;
            ideal: number;
            max: number;
        };
        avgSentenceLength: {
            min: number;
            ideal: number;
            max: number;
        };
        complexWordsPercent: {
            min: number;
            ideal: number;
            max: number;
        };
    };
};
//# sourceMappingURL=promptTemplates.d.ts.map