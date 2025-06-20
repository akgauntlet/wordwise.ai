/**
 * @fileoverview Example prompts and test cases for AI analysis validation
 * @module utils/promptExamples
 * @author WordWise.ai Team
 * @created 2024-01-XX
 *
 * Dependencies:
 * - Prompt templates for generating examples
 * - AI types for structured examples
 *
 * Usage:
 * - Provide example prompts for testing different analysis types
 * - Demonstrate expected AI response formats
 * - Support development and validation of prompt templates
 * - Enable comprehensive testing of AI analysis functionality
 */
import { AnalysisOptions } from '../types/ai';
/**
 * Sample text content for testing different analysis types
 */
export declare const SAMPLE_TEXTS: {
    /**
     * Text with grammar errors common to ESL students
     */
    grammarIssues: string;
    /**
     * Text with style issues needing academic improvement
     */
    styleIssues: string;
    /**
     * Text with readability issues (too complex)
     */
    readabilityIssues: string;
    /**
     * Text with mixed issues across all categories
     */
    mixedIssues: string;
    /**
     * Well-written text for minimal suggestions
     */
    wellWritten: string;
};
/**
 * Example analysis options for different testing scenarios
 */
export declare const EXAMPLE_ANALYSIS_OPTIONS: Record<string, AnalysisOptions>;
/**
 * Generate example prompts for testing and documentation
 *
 * @param analysisType - Type of analysis to generate examples for
 * @returns Object containing system and user prompts
 */
export declare function generateExamplePrompts(analysisType: keyof typeof EXAMPLE_ANALYSIS_OPTIONS): {
    options: AnalysisOptions;
    systemPrompt: string;
    userPrompt: string;
    sampleText: string;
};
/**
 * Generate specialized prompt examples for each analysis type
 */
export declare function generateSpecializedPromptExamples(): {
    grammar: {
        prompt: string;
        sampleText: string;
        description: string;
    };
    style: {
        prompt: string;
        sampleText: string;
        description: string;
    };
    readability: {
        prompt: string;
        sampleText: string;
        description: string;
    };
};
/**
 * Expected response format examples for validation
 */
export declare const EXPECTED_RESPONSE_EXAMPLES: {
    /**
     * Example grammar suggestion response
     */
    grammarSuggestion: {
        id: string;
        type: "grammar";
        severity: "high";
        startOffset: number;
        endOffset: number;
        originalText: string;
        suggestedText: string;
        explanation: string;
        category: string;
        confidence: number;
        grammarRule: string;
        eslExplanation: string;
    };
    /**
     * Example style suggestion response
     */
    styleSuggestion: {
        id: string;
        type: "style";
        severity: "medium";
        startOffset: number;
        endOffset: number;
        originalText: string;
        suggestedText: string;
        explanation: string;
        category: string;
        confidence: number;
        styleCategory: "formality";
        impact: "high";
    };
    /**
     * Example readability suggestion response
     */
    readabilitySuggestion: {
        id: string;
        type: "readability";
        severity: "high";
        startOffset: number;
        endOffset: number;
        originalText: string;
        suggestedText: string;
        explanation: string;
        category: string;
        confidence: number;
        metric: "word-complexity";
        targetLevel: string;
    };
    /**
     * Example readability metrics
     */
    readabilityMetrics: {
        fleschScore: number;
        gradeLevel: number;
        avgSentenceLength: number;
        avgSyllablesPerWord: number;
        wordCount: number;
        sentenceCount: number;
        complexWordsPercent: number;
    };
};
/**
 * Test cases for prompt validation
 */
export declare const PROMPT_TEST_CASES: ({
    name: string;
    options: AnalysisOptions;
    text: string;
    expectedIssues: string[];
    minimumSuggestions: number;
    maximumSuggestions?: undefined;
} | {
    name: string;
    options: AnalysisOptions;
    text: string;
    expectedIssues: never[];
    minimumSuggestions: number;
    maximumSuggestions: number;
})[];
/**
 * Common ESL error patterns for prompt testing
 */
export declare const ESL_ERROR_PATTERNS: {
    articles: {
        examples: string[];
        expectedCorrections: string[];
    };
    prepositions: {
        examples: string[];
        expectedCorrections: string[];
    };
    subjectVerbAgreement: {
        examples: string[];
        expectedCorrections: string[];
    };
};
/**
 * Validation helper to check if a prompt contains required elements
 *
 * @param prompt - Generated prompt to validate
 * @param requiredElements - Array of required elements
 * @returns Validation result with missing elements
 */
export declare function validatePrompt(prompt: string, requiredElements: string[]): {
    isValid: boolean;
    missingElements: string[];
};
/**
 * Required elements for different prompt types
 */
export declare const REQUIRED_PROMPT_ELEMENTS: {
    grammar: string[];
    style: string[];
    readability: string[];
    responseFormat: string[];
};
//# sourceMappingURL=promptExamples.d.ts.map