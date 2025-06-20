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
 * Base system prompt that establishes the AI's role and context
 */
const BASE_SYSTEM_PROMPT = `You are WordWise Assistant, an expert writing coach specializing in helping ESL (English as Second Language) college students improve their academic writing. You have extensive experience in:

- Teaching English grammar to non-native speakers
- Academic writing standards for college-level work
- Common challenges faced by ESL students
- Providing clear, educational explanations
- Building student confidence through constructive feedback

Your responses must be encouraging, educational, and culturally sensitive. Always explain the "why" behind your suggestions to help students learn.`;

/**
 * JSON response format template that ensures consistent AI outputs
 */
const RESPONSE_FORMAT_TEMPLATE = `

CRITICAL: You must respond with a valid JSON object in exactly this format:

{
  "grammarSuggestions": [
    {
      "id": "unique_id",
      "type": "grammar",
      "severity": "low|medium|high",
      "startOffset": number,
      "endOffset": number,
      "originalText": "text with issue",
      "suggestedText": "corrected text",
      "explanation": "Clear explanation of the grammar rule",
      "category": "specific grammar category",
      "confidence": 0.0-1.0,
      "grammarRule": "rule name",
      "eslExplanation": "ESL-specific help"
    }
  ],
  "styleSuggestions": [
    {
      "id": "unique_id",
      "type": "style",
      "severity": "low|medium|high",
      "startOffset": number,
      "endOffset": number,
      "originalText": "text to improve",
      "suggestedText": "improved text",
      "explanation": "Why this improves the writing",
      "category": "style category",
      "confidence": 0.0-1.0,
      "styleCategory": "clarity|conciseness|tone|formality|word-choice",
      "impact": "low|medium|high"
    }
  ],
  "readabilitySuggestions": [
    {
      "id": "unique_id",
      "type": "readability",
      "severity": "low|medium|high",
      "startOffset": number,
      "endOffset": number,
      "originalText": "complex text",
      "suggestedText": "simplified text",
      "explanation": "How this improves readability",
      "category": "readability category",
      "confidence": 0.0-1.0,
      "metric": "sentence-length|word-complexity|paragraph-structure|transitions",
      "targetLevel": "target reading level"
    }
  ],
  "readabilityMetrics": {
    "fleschScore": number,
    "gradeLevel": number,
    "avgSentenceLength": number,
    "avgSyllablesPerWord": number,
    "wordCount": number,
    "sentenceCount": number,
    "complexWordsPercent": number
  }
}

IMPORTANT: 
- Use realistic character offsets that correspond to the actual text positions
- Provide concrete, actionable suggestions
- Include educational explanations suitable for ESL learners
- Ensure all JSON is valid and properly formatted
- Do not include markdown formatting in your response`;

/**
 * Grammar analysis prompt template focusing on ESL-specific grammar issues
 */
const GRAMMAR_ANALYSIS_TEMPLATE = `

GRAMMAR ANALYSIS FOCUS:

Analyze the text for grammar errors commonly made by ESL students, including:

1. **Subject-Verb Agreement**: Check for mismatches between subjects and verbs
   - Example issues: "The students goes" → "The students go"
   - Pay attention to collective nouns, indefinite pronouns, compound subjects

2. **Article Usage** (a, an, the): Critical for ESL learners
   - Identify missing articles: "Student is studying" → "The student is studying"
   - Incorrect article choice: "a university" vs "an university"
   - Unnecessary articles with uncountable nouns

3. **Preposition Errors**: Very challenging for ESL students
   - Time prepositions: "in Monday" → "on Monday"
   - Place prepositions: "at home" vs "in home"
   - Phrasal verbs: "depend from" → "depend on"

4. **Verb Tense Consistency**: Maintain proper tense throughout
   - Mixed tenses within sentences or paragraphs
   - Conditional statements: "If I was" → "If I were"
   - Perfect tenses usage

5. **Plural/Singular Forms**: Count vs non-count nouns
   - "Informations" → "Information"
   - "Advices" → "Advice"
   - "Peoples" → "People"

6. **Modal Verb Usage**: Can, could, should, must, might
   - "I can to go" → "I can go"
   - Probability vs ability vs permission

7. **Sentence Structure**: Word order and clause construction
   - Question formation: "Why you are here?" → "Why are you here?"
   - Relative clauses: proper use of who, which, that

For each grammar error found, provide:
- The specific grammar rule violated
- An ESL-friendly explanation of why it's incorrect
- The correct form and usage pattern
- A simple example to reinforce learning`;

/**
 * Style analysis prompt template for academic writing improvement
 */
const STYLE_ANALYSIS_TEMPLATE = `

STYLE ANALYSIS FOCUS:

Evaluate the writing style for academic college-level work, considering:

1. **Clarity and Precision**:
   - Identify vague or ambiguous statements
   - Suggest more specific word choices
   - Recommend clearer sentence structures
   - Flag unclear pronoun references

2. **Conciseness and Economy**:
   - Find wordy expressions: "due to the fact that" → "because"
   - Eliminate redundancy: "past history" → "history"
   - Reduce unnecessary qualifiers: "very unique" → "unique"
   - Streamline complex phrases

3. **Academic Tone and Formality**:
   - Replace informal language with academic alternatives
   - Avoid contractions: "don't" → "do not"
   - Suggest formal connectors: "also" → "furthermore"
   - Remove colloquialisms and slang

4. **Word Choice and Vocabulary**:
   - Enhance vocabulary with more sophisticated alternatives
   - Ensure consistent terminology throughout
   - Avoid repetitive word usage
   - Suggest discipline-specific terminology when appropriate

5. **Sentence Variety and Flow**:
   - Identify repetitive sentence patterns
   - Suggest varying sentence lengths and structures
   - Improve transitions between ideas
   - Enhance paragraph coherence

6. **Voice and Agency**:
   - Balance active and passive voice appropriately
   - Suggest active voice for clarity when needed
   - Maintain objective academic perspective
   - Ensure appropriate use of first person

For each style suggestion, explain:
- How the change improves the writing
- Why it's important for academic writing
- The impact on reader comprehension
- Alternative approaches when applicable`;

/**
 * Readability analysis prompt template for accessibility improvement
 */
const READABILITY_ANALYSIS_TEMPLATE = `

READABILITY ANALYSIS FOCUS:

Assess text readability for college-level comprehension, examining:

1. **Sentence Length and Complexity**:
   - Identify overly long sentences (>25 words)
   - Suggest breaking complex sentences into simpler ones
   - Recommend coordination vs subordination balance
   - Flag embedded clauses that hinder comprehension

2. **Word Complexity and Vocabulary Load**:
   - Identify unnecessarily complex vocabulary
   - Suggest simpler alternatives for difficult terms
   - Check for appropriate academic level
   - Balance sophisticated and accessible language

3. **Paragraph Structure and Organization**:
   - Evaluate paragraph length and focus
   - Check for clear topic sentences
   - Assess logical flow within paragraphs
   - Suggest better paragraph transitions

4. **Coherence and Cohesion**:
   - Identify missing connecting words or phrases
   - Suggest transitional expressions for clarity
   - Check for logical progression of ideas
   - Evaluate overall text organization

5. **Cognitive Load Reduction**:
   - Simplify complex concepts when possible
   - Suggest examples or explanations for abstract ideas
   - Identify information density issues
   - Recommend structural improvements

6. **ESL Reader Considerations**:
   - Account for non-native speaker challenges
   - Suggest culturally neutral examples
   - Identify idiomatic expressions that may confuse
   - Recommend explicit rather than implicit connections

For each readability suggestion, provide:
- The specific readability metric affected
- Target reading level recommendation
- Concrete examples of improvements
- Benefits for ESL readers specifically`;

/**
 * Generate comprehensive system prompt based on analysis options
 * 
 * @param options - Analysis configuration specifying which types to include
 * @returns Complete system prompt tailored to the requested analysis types
 */
export function generateComprehensiveSystemPrompt(options: AnalysisOptions): string {
  const { includeGrammar, includeStyle, includeReadability, audienceLevel, documentType } = options;
  
  let prompt = BASE_SYSTEM_PROMPT;
  
  // Add context based on audience level
  if (audienceLevel) {
    switch (audienceLevel) {
      case 'beginner':
        prompt += `\n\nSTUDENT LEVEL: BEGINNER ESL
- Use simple, clear explanations
- Provide basic grammar rules
- Focus on fundamental writing skills
- Give encouraging, supportive feedback`;
        break;
      case 'intermediate':
        prompt += `\n\nSTUDENT LEVEL: INTERMEDIATE ESL
- Provide moderate complexity explanations
- Include intermediate grammar concepts
- Focus on developing academic writing skills
- Balance challenge with support`;
        break;
      case 'advanced':
        prompt += `\n\nSTUDENT LEVEL: ADVANCED ESL
- Use sophisticated explanations
- Cover advanced grammar and style concepts
- Focus on polishing academic writing
- Provide nuanced feedback on style and tone`;
        break;
    }
  }
  
  // Add context based on document type
  if (documentType) {
    switch (documentType) {
      case 'essay':
        prompt += `\n\nDOCUMENT TYPE: ACADEMIC ESSAY
- Focus on thesis development and argumentation
- Emphasize formal academic tone
- Check for proper citation integration
- Ensure logical paragraph structure`;
        break;
      case 'email':
        prompt += `\n\nDOCUMENT TYPE: PROFESSIONAL EMAIL
- Focus on professional communication standards
- Check for appropriate formality level
- Ensure clear and concise messaging
- Verify proper email etiquette`;
        break;
      case 'letter':
        prompt += `\n\nDOCUMENT TYPE: FORMAL LETTER
- Focus on formal letter structure and conventions
- Check for appropriate tone and register
- Ensure proper formatting and organization
- Verify professional language use`;
        break;
      case 'report':
        prompt += `\n\nDOCUMENT TYPE: ACADEMIC REPORT
- Focus on objective, factual reporting
- Check for clear data presentation
- Ensure logical section organization
- Verify appropriate technical language`;
        break;
    }
  }
  
  // Add specific analysis focuses
  prompt += `\n\nANALYSIS INSTRUCTIONS:\n`;
  
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
    prompt += `\n\nFOCUS: Grammar correction for ${audienceLevel} ESL students`;
  }
  
  if (documentType) {
    prompt += `\n\nDocument type: ${documentType}`;
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
    prompt += `\n\nFOCUS: Style improvement for ${audienceLevel} ESL students`;
  }
  
  if (documentType) {
    prompt += `\n\nDocument type: ${documentType}`;
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
    prompt += `\n\nFOCUS: Readability improvement for ${audienceLevel} ESL students`;
  }
  
  if (documentType) {
    prompt += `\n\nDocument type: ${documentType}`;
  }
  
  prompt += READABILITY_ANALYSIS_TEMPLATE;
  prompt += RESPONSE_FORMAT_TEMPLATE;
  
  return prompt;
}

/**
 * Generate user prompt that presents the text for analysis
 * 
 * @param content - Text content to analyze
 * @param specificInstructions - Any additional specific instructions
 * @returns Formatted user prompt
 */
export function generateUserPrompt(
  content: string, 
  specificInstructions?: string
): string {
  let prompt = `Please analyze the following text according to your instructions:\n\n"${content}"`;
  
  if (specificInstructions) {
    prompt += `\n\nAdditional instructions: ${specificInstructions}`;
  }
  
  prompt += `\n\nRemember to:
- Provide specific character positions for startOffset and endOffset
- Include educational explanations suitable for ESL learners
- Be encouraging and constructive in your feedback
- Return only valid JSON without any markdown formatting`;
  
  return prompt;
}

/**
 * ESL-specific grammar rules and common error patterns
 */
export const ESL_GRAMMAR_PATTERNS = {
  articles: {
    rules: [
      'Use "a" before consonant sounds, "an" before vowel sounds',
      'Use "the" for specific, known items',
      'Omit articles with uncountable nouns in general statements'
    ],
    commonErrors: [
      { pattern: /\b(university|European|one)/gi, rule: 'Use "a" before consonant sounds' },
      { pattern: /\b(hour|honest|honor)/gi, rule: 'Use "an" before vowel sounds' }
    ]
  },
  prepositions: {
    timePrepositions: {
      'in': ['months', 'years', 'seasons', 'morning/afternoon/evening'],
      'on': ['days', 'dates', 'specific days'],
      'at': ['specific times', 'night', 'noon/midnight']
    },
    placePrepositions: {
      'in': ['countries', 'cities', 'enclosed spaces'],
      'on': ['streets', 'surfaces', 'floors'],
      'at': ['specific addresses', 'points', 'events']
    }
  },
  subjectVerbAgreement: {
    rules: [
      'Singular subjects take singular verbs',
      'Plural subjects take plural verbs',
      'Collective nouns are usually singular',
      'Indefinite pronouns (everyone, somebody) are singular'
    ]
  }
};

/**
 * Academic writing style guidelines for ESL students
 */
export const ACADEMIC_STYLE_GUIDELINES = {
  formalityMarkers: {
    avoid: ['contractions', 'colloquialisms', 'slang', 'first person overuse'],
    prefer: ['full forms', 'formal vocabulary', 'objective tone', 'precise terminology']
  },
  transitionWords: {
    addition: ['furthermore', 'moreover', 'additionally', 'in addition'],
    contrast: ['however', 'nevertheless', 'conversely', 'on the contrary'],
    cause: ['therefore', 'consequently', 'as a result', 'thus'],
    sequence: ['initially', 'subsequently', 'finally', 'ultimately']
  },
  wordChoice: {
    precision: 'Choose specific over general terms',
    sophistication: 'Use academic vocabulary appropriately',
    consistency: 'Maintain consistent terminology throughout'
  }
};

/**
 * Readability benchmarks and targets for different text types
 */
export const READABILITY_TARGETS = {
  collegeLevel: {
    fleschScore: { min: 30, ideal: 50, max: 70 },
    gradeLevel: { min: 13, ideal: 14, max: 16 },
    avgSentenceLength: { min: 15, ideal: 20, max: 25 },
    complexWordsPercent: { min: 10, ideal: 15, max: 25 }
  },
  eslFriendly: {
    fleschScore: { min: 40, ideal: 60, max: 80 },
    gradeLevel: { min: 11, ideal: 13, max: 15 },
    avgSentenceLength: { min: 12, ideal: 18, max: 22 },
    complexWordsPercent: { min: 8, ideal: 12, max: 20 }
  }
}; 
