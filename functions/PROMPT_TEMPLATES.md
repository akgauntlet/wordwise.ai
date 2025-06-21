# Prompt Templates Documentation

This document details the comprehensive prompt template system designed for WordWise.ai's AI text analysis functionality. The templates are specifically crafted for ESL (English as Second Language) college students and provide specialized analysis for grammar, style, and readability.

## Overview

The prompt template system consists of specialized, modular prompts that provide:

- **ESL-Specific Guidance**: Tailored for common challenges faced by non-native English speakers
- **Educational Focus**: Explanations designed to help students learn from their mistakes
- **Flexible Analysis Types**: Grammar, style, and readability analysis with customizable combinations
- **Audience Adaptation**: Different complexity levels for beginner, intermediate, and advanced students
- **Document Type Awareness**: Customized guidance for essays, emails, letters, and reports

## Architecture

### Core Components

1. **Base System Prompt**: Establishes the AI's role as WordWise Assistant
2. **Specialized Analysis Templates**: Grammar, style, and readability-focused prompts
3. **Response Format Template**: Ensures consistent JSON output structure
4. **User Prompt Generator**: Creates context-specific user prompts
5. **Validation System**: Tests prompt quality and completeness

### File Structure

```
functions/src/utils/
├── promptTemplates.ts       # Main prompt generation functions
├── promptExamples.ts        # Test cases and validation examples
└── openai.ts               # Integration with OpenAI API
```

## Prompt Types

### 1. Grammar Analysis Prompts

**Purpose**: Identify and correct grammar errors common to ESL students

**Key Focus Areas**:
- Subject-verb agreement
- Article usage (a, an, the)
- Preposition errors
- Verb tense consistency
- Plural/singular forms
- Modal verb usage
- Sentence structure

**Example Grammar Issues Detected**:
```typescript
"The students goes to library everyday" 
// → Grammar errors: "goes" should be "go", missing "the" before "library"
```

**ESL-Specific Features**:
- Common error patterns for non-native speakers
- Cultural context considerations
- Educational explanations with examples
- Rule-based corrections with reasoning

### 2. Style Analysis Prompts

**Purpose**: Improve academic writing style and tone

**Key Focus Areas**:
- Clarity and precision
- Conciseness and economy
- Academic tone and formality
- Word choice and vocabulary
- Sentence variety and flow
- Voice and agency

**Example Style Improvements**:
```typescript
"I think that maybe the research is sort of important"
// → "The evidence suggests the research is significant"
```

**Academic Writing Features**:
- Formal vs. informal language detection
- Transition word suggestions
- Vocabulary enhancement
- Tone appropriateness for academic contexts

### 3. Readability Analysis Prompts

**Purpose**: Optimize text accessibility and comprehension

**Key Focus Areas**:
- Sentence length and complexity
- Word complexity and vocabulary load
- Paragraph structure and organization
- Coherence and cohesion
- Cognitive load reduction
- ESL reader considerations

**Example Readability Improvements**:
```typescript
// Complex: "The multifaceted interdisciplinary approach..."
// Simplified: "Researchers use multiple methods to study..."
```

**ESL-Friendly Features**:
- Cultural neutrality in examples
- Explicit connection identification
- Simplified alternatives for complex concepts
- Reading level targeting

## Audience Level Customization

### Beginner ESL Students
- Simple, clear explanations
- Basic grammar rules focus
- Fundamental writing skills
- Encouraging, supportive feedback

### Intermediate ESL Students  
- Moderate complexity explanations
- Intermediate grammar concepts
- Academic writing skill development
- Balanced challenge and support

### Advanced ESL Students
- Sophisticated explanations
- Advanced grammar and style concepts
- Academic writing polishing
- Nuanced feedback on style and tone

## Document Type Specialization

### Academic Essays
- Thesis development and argumentation
- Formal academic tone
- Citation integration
- Logical paragraph structure

### Professional Emails
- Professional communication standards
- Appropriate formality levels
- Clear and concise messaging
- Email etiquette

### Formal Letters
- Letter structure and conventions
- Tone and register appropriateness
- Formatting and organization
- Professional language use

### Academic Reports
- Objective, factual reporting
- Clear data presentation
- Logical section organization
- Technical language appropriateness

## Response Format

All prompts ensure consistent JSON response structure:

```json
{
  "grammarSuggestions": [
    {
      "id": "unique_id",
      "type": "grammar",
      "severity": "low|medium|high",
      "startOffset": 0,
      "endOffset": 10,
      "originalText": "problematic text",
      "suggestedText": "corrected text",
      "explanation": "Clear explanation",
      "category": "specific category",
      "confidence": 0.95,
      "grammarRule": "rule name",
      "eslExplanation": "ESL-specific help"
    }
  ],
  "styleSuggestions": [...],
  "readabilitySuggestions": [...],
  "readabilityMetrics": {
    "fleschScore": 45.2,
    "gradeLevel": 14.1,
    "avgSentenceLength": 22.5,
    "avgSyllablesPerWord": 1.8,
    "wordCount": 156,
    "sentenceCount": 7,
    "complexWordsPercent": 18.5
  }
}
```

## Usage Examples

### Generate Grammar-Only Prompt
```typescript
import { generateGrammarPrompt } from '@/utils/promptTemplates';

const prompt = generateGrammarPrompt('beginner', 'essay');
// Returns comprehensive grammar analysis prompt for beginner ESL students
```

### Generate Comprehensive Analysis Prompt
```typescript
import { generateComprehensiveSystemPrompt } from '@/utils/promptTemplates';

const options = {
  includeGrammar: true,
  includeStyle: true,
  includeReadability: true,
  audienceLevel: 'intermediate',
  documentType: 'essay'
};

const prompt = generateComprehensiveSystemPrompt(options);
// Returns full analysis prompt with all features enabled
```

### Generate User Prompt
```typescript
import { generateUserPrompt } from '@/utils/promptTemplates';

const userPrompt = generateUserPrompt(
  "Text to analyze here",
  "Additional specific instructions"
);
// Returns formatted user prompt with educational reminders
```

## Testing and Validation

### Validation System
The prompt templates include a comprehensive validation system that checks:

- **Content Coverage**: All required elements present
- **ESL Specificity**: Appropriate non-native speaker guidance
- **Response Format**: Correct JSON structure requirements
- **Consistency**: Uniform base identity across all prompts
- **Variations**: Proper audience and document type adaptation

### Test Cases
```typescript
import { runAllValidationTests } from '@/tests/promptValidation';

runAllValidationTests();
// Runs comprehensive test suite on all prompt templates
```

### Sample Test Results
```
✅ Grammar Prompt Validation - All required grammar elements present
✅ Style Prompt Validation - All required style elements present  
✅ Readability Prompt Validation - All required readability elements present
✅ Comprehensive Prompt Validation - All required elements present
✅ ESL-Specific Content Validation - ESL content properly included
```

## Best Practices

### Prompt Design Principles
1. **Educational Focus**: Always explain the "why" behind suggestions
2. **Cultural Sensitivity**: Avoid assumptions about cultural background
3. **Positive Tone**: Encouraging and supportive feedback
4. **Specificity**: Concrete, actionable suggestions
5. **Consistency**: Uniform terminology and structure

### ESL Considerations
1. **Common Error Patterns**: Address typical non-native speaker mistakes
2. **Clear Examples**: Provide before/after comparisons
3. **Rule Explanations**: Include underlying grammar/style rules
4. **Progressive Difficulty**: Match complexity to student level
5. **Confidence Building**: Frame corrections as learning opportunities

### Maintenance Guidelines
1. **Regular Updates**: Keep prompts current with best practices
2. **Feedback Integration**: Incorporate user feedback and AI performance data
3. **Testing Coverage**: Maintain comprehensive test suite
4. **Documentation**: Keep examples and explanations up-to-date

## Performance Considerations

### Prompt Length (Optimized for Speed)
- **Grammar prompts**: ~300-500 characters
- **Style prompts**: ~300-500 characters  
- **Readability prompts**: ~300-500 characters
- **Comprehensive prompts**: ~800-1,200 characters
- **Real-time prompts**: ~200-400 characters

### Response Quality
- **Specificity**: Character-level text positioning
- **Accuracy**: High-confidence suggestions prioritized
- **Educational Value**: Explanations suitable for learning
- **Actionability**: Clear, implementable recommendations

## Integration Points

### OpenAI API Integration
The prompt templates integrate seamlessly with the OpenAI API through:

```typescript
// In analyzeText function
const systemPrompt = generateSystemPrompt(options);
const userPrompt = generateUserPrompt(content);

const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  temperature: 0.3,
  max_tokens: 4000
});
```

### Frontend Integration
The client application can specify analysis preferences:

```typescript
const analysisOptions = {
  includeGrammar: true,
  includeStyle: true, 
  includeReadability: false,
  audienceLevel: 'intermediate',
  documentType: 'essay'
};

const result = await analyzeText({
  content: userText,
  options: analysisOptions,
  userId: currentUser.uid
});
```

## Future Enhancements

### Planned Improvements
1. **Dynamic Prompts**: AI-generated prompt customization based on user history
2. **Multilingual Support**: Prompts for speakers of specific native languages
3. **Domain Specialization**: Subject-specific academic writing guidance
4. **Learning Progression**: Adaptive difficulty based on user improvement
5. **Collaboration Features**: Prompts for peer review and group writing

### Research Areas
1. **Prompt Optimization**: A/B testing for prompt effectiveness
2. **Bias Detection**: Ensuring cultural and linguistic neutrality
3. **Feedback Loops**: Incorporating user satisfaction into prompt refinement
4. **Performance Metrics**: Measuring educational impact and learning outcomes

---

This comprehensive prompt template system forms the foundation of WordWise.ai's educational AI writing assistance, providing ESL college students with targeted, culturally sensitive, and pedagogically sound feedback to improve their academic writing skills. 
