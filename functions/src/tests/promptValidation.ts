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

import { 
  generateComprehensiveSystemPrompt,
  generateGrammarPrompt,
  generateStylePrompt,
  generateReadabilityPrompt,
  generateUserPrompt
} from '../utils/promptTemplates';
import { 
  EXAMPLE_ANALYSIS_OPTIONS,
  SAMPLE_TEXTS,
  REQUIRED_PROMPT_ELEMENTS,
  validatePrompt,
  generateSpecializedPromptExamples
} from '../utils/promptExamples';

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
export function runPromptValidationTests(): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Test 1: Grammar-only prompt validation
  console.log('Testing grammar-only prompt...');
  const grammarPrompt = generateGrammarPrompt('beginner', 'essay');
  const grammarValidation = validatePrompt(grammarPrompt, REQUIRED_PROMPT_ELEMENTS.grammar);
  
  results.push({
    testName: 'Grammar Prompt Validation',
    passed: grammarValidation.isValid,
    details: grammarValidation.isValid 
      ? 'All required grammar elements present'
      : `Missing elements: ${grammarValidation.missingElements.join(', ')}`,
    promptLength: grammarPrompt.length,
    missingElements: grammarValidation.missingElements
  });

  // Test 2: Style-only prompt validation
  console.log('Testing style-only prompt...');
  const stylePrompt = generateStylePrompt('intermediate', 'essay');
  const styleValidation = validatePrompt(stylePrompt, REQUIRED_PROMPT_ELEMENTS.style);
  
  results.push({
    testName: 'Style Prompt Validation',
    passed: styleValidation.isValid,
    details: styleValidation.isValid 
      ? 'All required style elements present'
      : `Missing elements: ${styleValidation.missingElements.join(', ')}`,
    promptLength: stylePrompt.length,
    missingElements: styleValidation.missingElements
  });

  // Test 3: Readability-only prompt validation
  console.log('Testing readability-only prompt...');
  const readabilityPrompt = generateReadabilityPrompt('advanced', 'report');
  const readabilityValidation = validatePrompt(readabilityPrompt, REQUIRED_PROMPT_ELEMENTS.readability);
  
  results.push({
    testName: 'Readability Prompt Validation',
    passed: readabilityValidation.isValid,
    details: readabilityValidation.isValid 
      ? 'All required readability elements present'
      : `Missing elements: ${readabilityValidation.missingElements.join(', ')}`,
    promptLength: readabilityPrompt.length,
    missingElements: readabilityValidation.missingElements
  });

  // Test 4: Comprehensive prompt validation
  console.log('Testing comprehensive prompt...');
  const comprehensivePrompt = generateComprehensiveSystemPrompt(EXAMPLE_ANALYSIS_OPTIONS.comprehensive);
  const allRequiredElements = [
    ...REQUIRED_PROMPT_ELEMENTS.grammar,
    ...REQUIRED_PROMPT_ELEMENTS.style,
    ...REQUIRED_PROMPT_ELEMENTS.readability,
    ...REQUIRED_PROMPT_ELEMENTS.responseFormat
  ];
  const comprehensiveValidation = validatePrompt(comprehensivePrompt, allRequiredElements);
  
  results.push({
    testName: 'Comprehensive Prompt Validation',
    passed: comprehensiveValidation.isValid,
    details: comprehensiveValidation.isValid 
      ? 'All required comprehensive elements present'
      : `Missing elements: ${comprehensiveValidation.missingElements.join(', ')}`,
    promptLength: comprehensivePrompt.length,
    missingElements: comprehensiveValidation.missingElements
  });

  // Test 5: Response format validation
  console.log('Testing response format requirements...');
  const formatValidation = validatePrompt(comprehensivePrompt, REQUIRED_PROMPT_ELEMENTS.responseFormat);
  
  results.push({
    testName: 'Response Format Validation',
    passed: formatValidation.isValid,
    details: formatValidation.isValid 
      ? 'All required response format elements present'
      : `Missing format elements: ${formatValidation.missingElements.join(', ')}`,
    promptLength: comprehensivePrompt.length,
    missingElements: formatValidation.missingElements
  });

  // Test 6: ESL-specific content validation
  console.log('Testing ESL-specific content...');
  const eslElements = ['ESL', 'non-native', 'English as Second Language', 'educational'];
  const eslValidation = validatePrompt(comprehensivePrompt, eslElements);
  
  results.push({
    testName: 'ESL-Specific Content Validation',
    passed: eslValidation.isValid,
    details: eslValidation.isValid 
      ? 'ESL-specific content properly included'
      : `Missing ESL elements: ${eslValidation.missingElements.join(', ')}`,
    promptLength: comprehensivePrompt.length,
    missingElements: eslValidation.missingElements
  });

  // Test 7: User prompt validation
  console.log('Testing user prompt generation...');
  const userPrompt = generateUserPrompt(SAMPLE_TEXTS.mixedIssues);
  const userPromptElements = ['analyze', 'text', 'character positions', 'educational'];
  const userValidation = validatePrompt(userPrompt, userPromptElements);
  
  results.push({
    testName: 'User Prompt Validation',
    passed: userValidation.isValid,
    details: userValidation.isValid 
      ? 'User prompt contains all required elements'
      : `Missing user prompt elements: ${userValidation.missingElements.join(', ')}`,
    promptLength: userPrompt.length,
    missingElements: userValidation.missingElements
  });

  return results;
}

/**
 * Test different audience levels and document types
 * 
 * @returns Array of validation results for different configurations
 */
export function testPromptVariations(): ValidationResult[] {
  const results: ValidationResult[] = [];
  const audienceLevels = ['beginner', 'intermediate', 'advanced'];
  const documentTypes = ['essay', 'email', 'letter', 'report'];

  // Test different combinations
  for (const audienceLevel of audienceLevels) {
    for (const documentType of documentTypes) {
      const options = {
        includeGrammar: true,
        includeStyle: true,
        includeReadability: true,
        audienceLevel: audienceLevel as 'beginner' | 'intermediate' | 'advanced',
        documentType: documentType as 'essay' | 'email' | 'letter' | 'report'
      };

      const prompt = generateComprehensiveSystemPrompt(options);
      
      // Check that audience level and document type are mentioned
      const containsAudience = prompt.toLowerCase().includes(audienceLevel.toLowerCase());
      const containsDocType = prompt.toLowerCase().includes(documentType.toLowerCase());
      
      results.push({
        testName: `Prompt Variation: ${audienceLevel} ${documentType}`,
        passed: containsAudience && containsDocType,
        details: `Audience: ${containsAudience}, DocType: ${containsDocType}`,
        promptLength: prompt.length
      });
    }
  }

  return results;
}

/**
 * Validate prompt consistency across different analysis types
 * 
 * @returns Validation results for consistency checks
 */
export function testPromptConsistency(): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Generate all specialized prompts
  const specializedExamples = generateSpecializedPromptExamples();
  
  // Check that all prompts contain the base WordWise Assistant identity
  const baseIdentityElements = ['WordWise Assistant', 'ESL', 'college students', 'encouraging'];
  
  Object.entries(specializedExamples).forEach(([type, example]) => {
    const validation = validatePrompt(example.prompt, baseIdentityElements);
    
    results.push({
      testName: `Base Identity Consistency - ${type}`,
      passed: validation.isValid,
      details: validation.isValid 
        ? 'Base identity elements consistently present'
        : `Missing identity elements: ${validation.missingElements.join(', ')}`,
      promptLength: example.prompt.length,
      missingElements: validation.missingElements
    });
  });

  return results;
}

/**
 * Run all validation tests and print results
 */
export function runAllValidationTests(): void {
  console.log('🧪 Starting Prompt Template Validation Tests...\n');

  // Run main validation tests
  console.log('=== Main Validation Tests ===');
  const mainResults = runPromptValidationTests();
  printResults(mainResults);

  // Run variation tests
  console.log('\n=== Prompt Variation Tests ===');
  const variationResults = testPromptVariations();
  printResults(variationResults);

  // Run consistency tests
  console.log('\n=== Consistency Tests ===');
  const consistencyResults = testPromptConsistency();
  printResults(consistencyResults);

  // Summary
  const allResults = [...mainResults, ...variationResults, ...consistencyResults];
  const passedTests = allResults.filter(r => r.passed).length;
  const totalTests = allResults.length;
  
  console.log('\n=== SUMMARY ===');
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All prompt validation tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Review the details above.');
  }
}

/**
 * Print validation results in a formatted way
 * 
 * @param results - Array of validation results to print
 */
function printResults(results: ValidationResult[]): void {
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.testName}`);
    console.log(`   Details: ${result.details}`);
    console.log(`   Prompt Length: ${result.promptLength} characters`);
    
    if (result.missingElements && result.missingElements.length > 0) {
      console.log(`   Missing: ${result.missingElements.join(', ')}`);
    }
    console.log();
  });
}

/**
 * Sample prompt generation for manual review
 * 
 * @returns Object containing sample prompts for each analysis type
 */
export function generateSamplePrompts() {
  return {
    grammarFocused: {
      system: generateGrammarPrompt('beginner', 'essay'),
      user: generateUserPrompt(SAMPLE_TEXTS.grammarIssues),
      description: 'Grammar analysis for beginner ESL student essay'
    },
    styleFocused: {
      system: generateStylePrompt('intermediate', 'essay'),
      user: generateUserPrompt(SAMPLE_TEXTS.styleIssues),
      description: 'Style improvement for intermediate academic writing'
    },
    readabilityFocused: {
      system: generateReadabilityPrompt('advanced', 'report'),
      user: generateUserPrompt(SAMPLE_TEXTS.readabilityIssues),
      description: 'Readability analysis for advanced academic report'
    },
    comprehensive: {
      system: generateComprehensiveSystemPrompt(EXAMPLE_ANALYSIS_OPTIONS.comprehensive),
      user: generateUserPrompt(SAMPLE_TEXTS.mixedIssues),
      description: 'Comprehensive analysis with all features enabled'
    }
  };
}

// Export for testing
export {
  validatePrompt,
  REQUIRED_PROMPT_ELEMENTS
}; 
