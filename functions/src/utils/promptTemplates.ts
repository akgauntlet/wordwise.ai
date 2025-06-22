/**
 * @fileoverview Document-type-specific AI prompt templates for specialized text analysis
 * @module utils/promptTemplates
 * @author WordWise.ai Team
 * @created 2024-01-XX
 * 
 * Dependencies:
 * - AI analysis types for prompt customization
 * 
 * Usage:
 * - Generate document-type-specific prompts for grammar, style, and readability analysis
 * - Optimized for document-specific writing conventions and expectations
 * - Support different audience levels and specialized suggestion categories
 */

import { AnalysisOptions } from '../types/ai';

/**
 * Document-type-specific prompt templates with specialized instructions
 */
const DOCUMENT_TYPE_PROMPTS = {
  'creative-writing': {
    systemPrompt: `You are a creative writing coach for ESL students. Analyze creative writing and provide suggestions to improve storytelling, character development, and narrative flow.`,
    specificCategories: {
      style: [
        'character-voice-consistency',
        'dialogue-authenticity',
        'show-vs-tell',
        'sensory-details',
        'pacing-rhythm',
        'point-of-view-consistency'
      ],
      grammar: [
        'dialogue-punctuation',
        'narrative-tense-consistency',
        'creative-fragments',
        'internal-thought-formatting'
      ],
      structure: [
        'scene-transitions',
        'hook-effectiveness',
        'conflict-escalation',
        'resolution-pacing'
      ]
    },
    analysisInstructions: `
For creative writing, focus on:
- Character voice consistency and authenticity
- Dialogue that sounds natural and advances the story
- Show vs. tell techniques (use concrete details instead of abstract statements)
- Sensory details to immerse readers
- Pacing and rhythm in sentence structure
- Point of view consistency throughout the narrative
- Creative use of punctuation for effect
- Narrative tense consistency
- Effective scene transitions and story structure`
  },

  'academic': {
    systemPrompt: `You are an academic writing tutor for ESL students. Analyze academic papers and provide suggestions to improve argumentation, clarity, and scholarly tone.`,
    specificCategories: {
      style: [
        'thesis-clarity',
        'argument-structure',
        'citation-integration',
        'objective-tone',
        'idea-transitions',
        'evidence-analysis'
      ],
      grammar: [
        'academic-voice',
        'research-tense-usage',
        'conditional-language',
        'passive-voice-appropriateness'
      ],
      structure: [
        'introduction-effectiveness',
        'paragraph-unity',
        'conclusion-strength',
        'section-organization'
      ]
    },
    analysisInstructions: `
For academic writing, focus on:
- Clear and arguable thesis statements
- Logical argument structure and flow
- Proper integration of citations and evidence
- Objective, scholarly tone (avoid first person)
- Smooth transitions between ideas and paragraphs
- Evidence-to-claim ratio and analysis depth
- Appropriate use of academic language and terminology
- Proper verb tenses for discussing research
- Strong introductions and conclusions
- Clear paragraph unity and coherence`
  },

  'business': {
    systemPrompt: `You are a business writing consultant for ESL professionals. Analyze business documents and provide suggestions to improve professionalism, clarity, and persuasiveness.`,
    specificCategories: {
      style: [
        'professional-tone',
        'action-oriented-language',
        'conciseness-optimization',
        'stakeholder-appropriate-formality',
        'call-to-action-clarity',
        'executive-summary-effectiveness'
      ],
      grammar: [
        'active-voice-preference',
        'email-conventions',
        'parallel-structure',
        'business-punctuation'
      ],
      structure: [
        'key-points-prominence',
        'professional-formatting',
        'logical-flow',
        'audience-focus'
      ]
    },
    analysisInstructions: `
For business writing, focus on:
- Professional and appropriate tone for the audience
- Action-oriented, results-focused language
- Conciseness without sacrificing clarity
- Clear calls to action and next steps
- Proper business email and document conventions
- Active voice preference for authority and clarity
- Parallel structure in lists and bullet points
- Prominent placement of key information
- Logical flow that serves business objectives
- Audience-focused content and tone`
  },

  'script': {
    systemPrompt: `You are a screenwriting coach for ESL students. Analyze scripts and provide suggestions to improve dialogue, character differentiation, and dramatic structure.`,
    specificCategories: {
      style: [
        'character-voice-differentiation',
        'dialogue-naturalism',
        'stage-direction-clarity',
        'action-line-efficiency',
        'subtext-development'
      ],
      grammar: [
        'script-formatting',
        'present-tense-consistency',
        'character-name-consistency',
        'action-description-style'
      ],
      structure: [
        'scene-setup',
        'dialogue-action-balance',
        'character-introduction-timing',
        'dramatic-pacing'
      ]
    },
    analysisInstructions: `
For script writing, focus on:
- Distinct character voices that differentiate speakers
- Natural, realistic dialogue that serves the story
- Clear, concise stage directions and action lines
- Proper script formatting conventions
- Present tense consistency in action descriptions
- Efficient scene setup and character introductions
- Balance between dialogue and action
- Subtext and implied meaning in dialogue
- Dramatic pacing and tension building
- Character name consistency throughout`
  },

  'essay': {
    systemPrompt: `You are an essay writing tutor for ESL students. Analyze essays and provide suggestions to improve argumentation, structure, and persuasive writing.`,
    specificCategories: {
      style: [
        'thesis-development',
        'argument-clarity',
        'evidence-presentation',
        'persuasive-techniques',
        'counter-argument-handling'
      ],
      grammar: [
        'formal-essay-tone',
        'complex-sentence-structure',
        'transition-words',
        'pronoun-consistency'
      ],
      structure: [
        'introduction-hook',
        'body-paragraph-organization',
        'conclusion-impact',
        'overall-coherence'
      ]
    },
    analysisInstructions: `
For essay writing, focus on:
- Strong thesis development and argumentation
- Clear presentation of evidence and examples
- Effective use of persuasive techniques
- Proper handling of counter-arguments
- Formal essay tone and language
- Complex sentence structures for sophisticated ideas
- Effective transition words and phrases
- Strong introduction hooks and impactful conclusions
- Logical body paragraph organization
- Overall coherence and flow`
  },

  'email': {
    systemPrompt: `You are a professional email writing consultant for ESL professionals. Analyze emails and provide suggestions to improve clarity, professionalism, and effectiveness.`,
    specificCategories: {
      style: [
        'subject-line-clarity',
        'opening-appropriateness',
        'message-conciseness',
        'closing-professionalism',
        'tone-appropriateness'
      ],
      grammar: [
        'email-punctuation',
        'salutation-format',
        'signature-format',
        'attachment-references'
      ],
      structure: [
        'information-hierarchy',
        'action-items-clarity',
        'response-requirements',
        'professional-formatting'
      ]
    },
    analysisInstructions: `
For email writing, focus on:
- Clear, descriptive subject lines
- Appropriate opening and closing for the relationship
- Concise message that respects recipient's time
- Professional tone appropriate to the context
- Proper email punctuation and formatting
- Clear salutations and signature blocks
- Logical information hierarchy (most important first)
- Clear action items and response requirements
- Professional formatting and structure
- Appropriate references to attachments or links`
  },

  'general': {
    systemPrompt: `You are a general writing tutor for ESL students. Analyze text and provide suggestions to improve clarity, grammar, and overall communication effectiveness.`,
    specificCategories: {
      style: [
        'clarity-improvement',
        'word-choice-precision',
        'sentence-variety',
        'tone-consistency',
        'audience-awareness'
      ],
      grammar: [
        'basic-grammar-rules',
        'sentence-structure',
        'punctuation-usage',
        'verb-agreement'
      ],
      structure: [
        'paragraph-organization',
        'logical-flow',
        'introduction-conclusion',
        'supporting-details'
      ]
    },
    analysisInstructions: `
For general writing, focus on:
- Overall clarity and communication effectiveness
- Precise word choice and vocabulary
- Sentence variety and structure
- Consistent tone throughout
- Audience-appropriate language and style
- Basic grammar rule compliance
- Proper punctuation usage
- Logical paragraph organization and flow
- Clear introductions and conclusions
- Adequate supporting details and examples`
  }
};

/**
 * Enhanced JSON response format template with document-specific categories
 */
const ENHANCED_RESPONSE_FORMAT = `

Return valid JSON only with this exact structure:
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
      "documentSpecificCategory": "document-specific-category-name",
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
      "documentSpecificCategory": "document-specific-category-name",
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
      "documentSpecificCategory": "document-specific-category-name",
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

IMPORTANT: Use documentSpecificCategory values from the specific document type categories provided. Provide actual suggestions when issues are found. Return empty arrays only if no issues exist.`;

/**
 * Generate document-type-specific system prompt
 * 
 * @param options - Analysis configuration specifying document type and analysis types
 * @returns Complete system prompt tailored to the document type and requested analysis
 */
export function generateDocumentSpecificSystemPrompt(options: AnalysisOptions): string {
  const documentType = options.documentType || 'general';
  const docConfig = DOCUMENT_TYPE_PROMPTS[documentType];
  
  let prompt = docConfig.systemPrompt;
  
  // Add audience level context
  if (options.audienceLevel) {
    prompt += ` Focus on ${options.audienceLevel} level suggestions.`;
  }
  
  // Add specific analysis instructions
  prompt += docConfig.analysisInstructions;
  
  // Add specific category instructions
  const categories = [];
  if (options.includeGrammar) categories.push('grammar');
  if (options.includeStyle) categories.push('style');
  if (options.includeReadability) categories.push('structure');
  
  if (categories.length > 0) {
    prompt += `\n\nFor this ${documentType} document, pay special attention to these categories:`;
    
    categories.forEach(category => {
      const categoryKey = category as 'grammar' | 'style' | 'structure';
      if (docConfig.specificCategories[categoryKey]) {
        prompt += `\n\n${category.toUpperCase()} suggestions should use these document-specific categories:`;
        docConfig.specificCategories[categoryKey].forEach((specificCategory: string) => {
          prompt += `\n- ${specificCategory}`;
        });
      }
    });
  }
  
  // Add response format requirements
  prompt += ENHANCED_RESPONSE_FORMAT;
  
  return prompt;
}

/**
 * Generate comprehensive system prompt (legacy compatibility)
 * 
 * @param options - Analysis configuration specifying which types to include
 * @returns Complete system prompt tailored to the requested analysis types
 */
export function generateComprehensiveSystemPrompt(options: AnalysisOptions): string {
  return generateDocumentSpecificSystemPrompt(options);
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
  
  prompt += `\n\nReturn JSON only with accurate character positions and appropriate documentSpecificCategory values.`;
  
  return prompt;
}

/**
 * Generate lightweight system prompt for real-time analysis
 * 
 * @param options - Analysis configuration
 * @returns Lightweight system prompt optimized for speed
 */
export function generateLightweightSystemPrompt(options: AnalysisOptions): string {
  const documentType = options.documentType || 'general';
  const docConfig = DOCUMENT_TYPE_PROMPTS[documentType];
  
  // Debug logging
  console.log(`[DEBUG] Generating prompt for document type: ${documentType}`);
  console.log(`[DEBUG] Using system prompt: ${docConfig.systemPrompt.substring(0, 100)}...`);
  
  let prompt = `${docConfig.systemPrompt} Perform quick analysis and provide helpful suggestions.`;
  
  const checks = [];
  if (options.includeGrammar) checks.push('grammar');
  if (options.includeStyle) checks.push('style'); 
  if (options.includeReadability) checks.push('readability');
  
  if (checks.length > 0) {
    prompt += ` Analyze for: ${checks.join(', ')}.`;
  }
  
  // Add specific category instructions (this was missing!)
  const categories = [];
  if (options.includeGrammar) categories.push('grammar');
  if (options.includeStyle) categories.push('style');
  if (options.includeReadability) categories.push('structure');
  
  if (categories.length > 0) {
    prompt += `\n\nFor this ${documentType} document, use these specific documentSpecificCategory values:`;
    
    categories.forEach(category => {
      const categoryKey = category as 'grammar' | 'style' | 'structure';
      if (docConfig.specificCategories[categoryKey]) {
        console.log(`[DEBUG] Adding ${category} categories for ${documentType}:`, docConfig.specificCategories[categoryKey]);
        prompt += `\n\n${category.toUpperCase()} suggestions must use these exact documentSpecificCategory values:`;
        docConfig.specificCategories[categoryKey].forEach((specificCategory: string) => {
          prompt += `\n- ${specificCategory}`;
        });
      }
    });
  }
  
  prompt += `\n\nFind actual issues and provide specific suggestions for ${documentType} writing.`;
  prompt += ENHANCED_RESPONSE_FORMAT;
  prompt += `\n\nIMPORTANT: Use ONLY the specific documentSpecificCategory values listed above. Do NOT use generic categories like "${documentType}" or "academic-writing".`;
  
  return prompt;
}

/**
 * Generate lightweight user prompt for real-time analysis
 * 
 * @param content - Text content to analyze
 * @returns Simplified user prompt
 */
export function generateLightweightUserPrompt(content: string): string {
  return `Quick analysis:\n\n"${content}"\n\nJSON only with documentSpecificCategory.`;
}

// Legacy compatibility functions
export function generateGrammarPrompt(
  audienceLevel?: 'beginner' | 'intermediate' | 'advanced', 
  documentType?: 'essay' | 'creative-writing' | 'script' | 'general' | 'email' | 'academic' | 'business'
): string {
  const options: AnalysisOptions = {
    includeGrammar: true,
    includeStyle: false,
    includeReadability: false,
    audienceLevel,
    documentType
  };
  return generateDocumentSpecificSystemPrompt(options);
}

export function generateStylePrompt(
  audienceLevel?: 'beginner' | 'intermediate' | 'advanced', 
  documentType?: 'essay' | 'creative-writing' | 'script' | 'general' | 'email' | 'academic' | 'business'
): string {
  const options: AnalysisOptions = {
    includeGrammar: false,
    includeStyle: true,
    includeReadability: false,
    audienceLevel,
    documentType
  };
  return generateDocumentSpecificSystemPrompt(options);
}

export function generateReadabilityPrompt(
  audienceLevel?: 'beginner' | 'intermediate' | 'advanced', 
  documentType?: 'essay' | 'creative-writing' | 'script' | 'general' | 'email' | 'academic' | 'business'
): string {
  const options: AnalysisOptions = {
    includeGrammar: false,
    includeStyle: false,
    includeReadability: true,
    audienceLevel,
    documentType
  };
  return generateDocumentSpecificSystemPrompt(options);
}

// Minimal compatibility exports for existing code
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
