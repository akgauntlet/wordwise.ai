"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUIRED_PROMPT_ELEMENTS = exports.ESL_ERROR_PATTERNS = exports.PROMPT_TEST_CASES = exports.EXPECTED_RESPONSE_EXAMPLES = exports.EXAMPLE_ANALYSIS_OPTIONS = exports.SAMPLE_TEXTS = void 0;
exports.generateExamplePrompts = generateExamplePrompts;
exports.generateSpecializedPromptExamples = generateSpecializedPromptExamples;
exports.validatePrompt = validatePrompt;
const promptTemplates_1 = require("./promptTemplates");
/**
 * Sample text content for testing different analysis types
 */
exports.SAMPLE_TEXTS = {
    /**
     * Text with grammar errors common to ESL students
     */
    grammarIssues: `The students goes to library everyday. They want to studying English more better. Each person have different learning style, but all of them needs help with grammars. Professor give many advices about how to improve their writings skills.`,
    /**
     * Text with style issues needing academic improvement
     */
    styleIssues: `I think that maybe the research is sort of important. The study was really very significant and it's super interesting. We can see that the results are pretty good. In my opinion, I believe that this is a great discovery that will help lots of people.`,
    /**
     * Text with readability issues (too complex)
     */
    readabilityIssues: `The multifaceted interdisciplinary approach to socioeconomic stratification analysis, which encompasses a comprehensive examination of demographic variables alongside psychosocial determinants, necessitates the implementation of sophisticated methodological frameworks that can adequately address the inherent complexities and nuanced relationships between various factors influencing educational attainment outcomes.`,
    /**
     * Text with mixed issues across all categories
     */
    mixedIssues: `In my opinion, I thinks that the students performance in university is depend on many factor. First of all, they must has good study habits and also they should to manage their time effectively. The research shows that students who doesn't have proper planning often struggle with their academic achievement. Furthermore, it's really important for them to develop critical thinking skills which are absolutely essential for success in higher education.`,
    /**
     * Well-written text for minimal suggestions
     */
    wellWritten: `Academic success in higher education depends on several key factors. Students must develop effective study habits and time management skills to achieve their goals. Research indicates that students who plan their schedules carefully tend to perform better academically. Additionally, critical thinking skills are essential for success in college-level coursework.`
};
/**
 * Example analysis options for different testing scenarios
 */
exports.EXAMPLE_ANALYSIS_OPTIONS = {
    /**
     * Grammar-only analysis for beginner ESL students
     */
    grammarOnly: {
        includeGrammar: true,
        includeStyle: false,
        includeReadability: false,
        audienceLevel: 'beginner',
        documentType: 'essay'
    },
    /**
     * Style-only analysis for intermediate students
     */
    styleOnly: {
        includeGrammar: false,
        includeStyle: true,
        includeReadability: false,
        audienceLevel: 'intermediate',
        documentType: 'essay'
    },
    /**
     * Readability-only analysis for advanced students
     */
    readabilityOnly: {
        includeGrammar: false,
        includeStyle: false,
        includeReadability: true,
        audienceLevel: 'advanced',
        documentType: 'report'
    },
    /**
     * Comprehensive analysis for intermediate students
     */
    comprehensive: {
        includeGrammar: true,
        includeStyle: true,
        includeReadability: true,
        audienceLevel: 'intermediate',
        documentType: 'essay'
    },
    /**
     * Email-specific analysis
     */
    emailAnalysis: {
        includeGrammar: true,
        includeStyle: true,
        includeReadability: false,
        audienceLevel: 'intermediate',
        documentType: 'email'
    },
    /**
     * Advanced academic report analysis
     */
    academicReport: {
        includeGrammar: true,
        includeStyle: true,
        includeReadability: true,
        audienceLevel: 'advanced',
        documentType: 'report'
    }
};
/**
 * Generate example prompts for testing and documentation
 *
 * @param analysisType - Type of analysis to generate examples for
 * @returns Object containing system and user prompts
 */
function generateExamplePrompts(analysisType) {
    const options = exports.EXAMPLE_ANALYSIS_OPTIONS[analysisType];
    const sampleText = exports.SAMPLE_TEXTS.mixedIssues; // Use mixed issues as default
    return {
        options,
        systemPrompt: (0, promptTemplates_1.generateComprehensiveSystemPrompt)(options),
        userPrompt: (0, promptTemplates_1.generateUserPrompt)(sampleText),
        sampleText
    };
}
/**
 * Generate specialized prompt examples for each analysis type
 */
function generateSpecializedPromptExamples() {
    return {
        grammar: {
            prompt: (0, promptTemplates_1.generateGrammarPrompt)('beginner', 'essay'),
            sampleText: exports.SAMPLE_TEXTS.grammarIssues,
            description: 'Grammar-focused analysis for beginner ESL students'
        },
        style: {
            prompt: (0, promptTemplates_1.generateStylePrompt)('intermediate', 'essay'),
            sampleText: exports.SAMPLE_TEXTS.styleIssues,
            description: 'Style improvement analysis for intermediate students'
        },
        readability: {
            prompt: (0, promptTemplates_1.generateReadabilityPrompt)('advanced', 'report'),
            sampleText: exports.SAMPLE_TEXTS.readabilityIssues,
            description: 'Readability analysis for advanced academic writing'
        }
    };
}
/**
 * Expected response format examples for validation
 */
exports.EXPECTED_RESPONSE_EXAMPLES = {
    /**
     * Example grammar suggestion response
     */
    grammarSuggestion: {
        id: "grammar_001",
        type: "grammar",
        severity: "high",
        startOffset: 4,
        endOffset: 16,
        originalText: "students goes",
        suggestedText: "students go",
        explanation: "Subject-verb agreement error: plural subject 'students' requires plural verb 'go'",
        category: "subject-verb agreement",
        confidence: 0.95,
        grammarRule: "Subject-Verb Agreement",
        eslExplanation: "When the subject is plural (students), the verb must also be plural (go, not goes). Remember: singular subjects take singular verbs, plural subjects take plural verbs."
    },
    /**
     * Example style suggestion response
     */
    styleSuggestion: {
        id: "style_001",
        type: "style",
        severity: "medium",
        startOffset: 0,
        endOffset: 15,
        originalText: "I think that maybe",
        suggestedText: "The evidence suggests",
        explanation: "Replace uncertain, informal language with confident academic phrasing",
        category: "academic tone",
        confidence: 0.88,
        styleCategory: "formality",
        impact: "high"
    },
    /**
     * Example readability suggestion response
     */
    readabilitySuggestion: {
        id: "readability_001",
        type: "readability",
        severity: "high",
        startOffset: 0,
        endOffset: 89,
        originalText: "The multifaceted interdisciplinary approach to socioeconomic stratification analysis...",
        suggestedText: "Researchers use multiple methods to study social and economic differences...",
        explanation: "Break down complex academic jargon into clearer, more accessible language",
        category: "word complexity",
        confidence: 0.92,
        metric: "word-complexity",
        targetLevel: "Grade 14"
    },
    /**
     * Example readability metrics
     */
    readabilityMetrics: {
        fleschScore: 45.2,
        gradeLevel: 14.1,
        avgSentenceLength: 22.5,
        avgSyllablesPerWord: 1.8,
        wordCount: 156,
        sentenceCount: 7,
        complexWordsPercent: 18.5
    }
};
/**
 * Test cases for prompt validation
 */
exports.PROMPT_TEST_CASES = [
    {
        name: "Grammar Analysis - Beginner ESL",
        options: exports.EXAMPLE_ANALYSIS_OPTIONS.grammarOnly,
        text: exports.SAMPLE_TEXTS.grammarIssues,
        expectedIssues: ["subject-verb agreement", "article usage", "preposition errors"],
        minimumSuggestions: 3
    },
    {
        name: "Style Analysis - Academic Writing",
        options: exports.EXAMPLE_ANALYSIS_OPTIONS.styleOnly,
        text: exports.SAMPLE_TEXTS.styleIssues,
        expectedIssues: ["informal language", "redundancy", "weak qualifiers"],
        minimumSuggestions: 4
    },
    {
        name: "Readability Analysis - Complex Text",
        options: exports.EXAMPLE_ANALYSIS_OPTIONS.readabilityOnly,
        text: exports.SAMPLE_TEXTS.readabilityIssues,
        expectedIssues: ["sentence length", "word complexity", "clarity"],
        minimumSuggestions: 2
    },
    {
        name: "Comprehensive Analysis - Mixed Issues",
        options: exports.EXAMPLE_ANALYSIS_OPTIONS.comprehensive,
        text: exports.SAMPLE_TEXTS.mixedIssues,
        expectedIssues: ["grammar", "style", "readability"],
        minimumSuggestions: 5
    },
    {
        name: "Well-Written Text - Minimal Suggestions",
        options: exports.EXAMPLE_ANALYSIS_OPTIONS.comprehensive,
        text: exports.SAMPLE_TEXTS.wellWritten,
        expectedIssues: [],
        minimumSuggestions: 0,
        maximumSuggestions: 2
    }
];
/**
 * Common ESL error patterns for prompt testing
 */
exports.ESL_ERROR_PATTERNS = {
    articles: {
        examples: [
            "Student is studying hard", // Missing article
            "The informations are helpful", // Incorrect article with uncountable noun
            "I go to the university", // Unnecessary article
        ],
        expectedCorrections: [
            "The student is studying hard",
            "The information is helpful",
            "I go to university"
        ]
    },
    prepositions: {
        examples: [
            "I arrived to the meeting", // Wrong preposition
            "We discussed about the problem", // Unnecessary preposition
            "She depends from her parents", // Wrong preposition
        ],
        expectedCorrections: [
            "I arrived at the meeting",
            "We discussed the problem",
            "She depends on her parents"
        ]
    },
    subjectVerbAgreement: {
        examples: [
            "The team are playing well", // Collective noun confusion
            "Each of the students have a book", // Indefinite pronoun
            "There is many problems", // Expletive construction
        ],
        expectedCorrections: [
            "The team is playing well",
            "Each of the students has a book",
            "There are many problems"
        ]
    }
};
/**
 * Validation helper to check if a prompt contains required elements
 *
 * @param prompt - Generated prompt to validate
 * @param requiredElements - Array of required elements
 * @returns Validation result with missing elements
 */
function validatePrompt(prompt, requiredElements) {
    const missingElements = requiredElements.filter(element => !prompt.toLowerCase().includes(element.toLowerCase()));
    return {
        isValid: missingElements.length === 0,
        missingElements
    };
}
/**
 * Required elements for different prompt types
 */
exports.REQUIRED_PROMPT_ELEMENTS = {
    grammar: [
        'grammar',
        'subject-verb agreement',
        'article usage',
        'preposition',
        'ESL',
        'explanation'
    ],
    style: [
        'style',
        'academic',
        'formality',
        'clarity',
        'conciseness',
        'tone'
    ],
    readability: [
        'readability',
        'sentence length',
        'word complexity',
        'paragraph structure',
        'ESL readers'
    ],
    responseFormat: [
        'JSON',
        'grammarSuggestions',
        'styleSuggestions',
        'readabilitySuggestions',
        'startOffset',
        'endOffset'
    ]
};
//# sourceMappingURL=promptExamples.js.map