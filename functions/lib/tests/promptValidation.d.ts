/**
 * @fileoverview Validation script for testing prompt templates
 * @module tests/promptValidation
 * @author WordWise.ai Team
 * @created 2024-01-XX
 *
 * Dependencies:
 * - Prompt templates and examples for testing
 *
 * Usage:
 * - Run validation tests on prompt templates
 * - Verify prompt structure and content
 * - Ensure consistency across different analysis types
 * - Test ESL-specific guidance inclusion
 */
import { REQUIRED_PROMPT_ELEMENTS, validatePrompt } from '../utils/promptExamples';
/**
 * Validation results interface
 */
interface ValidationResult {
    testName: string;
    passed: boolean;
    details: string;
    promptLength: number;
    missingElements?: string[];
}
/**
 * Run comprehensive validation tests on all prompt templates
 *
 * @returns Array of validation results
 */
export declare function runPromptValidationTests(): ValidationResult[];
/**
 * Test different audience levels and document types
 *
 * @returns Array of validation results for different configurations
 */
export declare function testPromptVariations(): ValidationResult[];
/**
 * Validate prompt consistency across different analysis types
 *
 * @returns Validation results for consistency checks
 */
export declare function testPromptConsistency(): ValidationResult[];
/**
 * Run all validation tests and print results
 */
export declare function runAllValidationTests(): void;
/**
 * Sample prompt generation for manual review
 *
 * @returns Object containing sample prompts for each analysis type
 */
export declare function generateSamplePrompts(): {
    grammarFocused: {
        system: string;
        user: string;
        description: string;
    };
    styleFocused: {
        system: string;
        user: string;
        description: string;
    };
    readabilityFocused: {
        system: string;
        user: string;
        description: string;
    };
    comprehensive: {
        system: string;
        user: string;
        description: string;
    };
};
export { validatePrompt, REQUIRED_PROMPT_ELEMENTS };
//# sourceMappingURL=promptValidation.d.ts.map