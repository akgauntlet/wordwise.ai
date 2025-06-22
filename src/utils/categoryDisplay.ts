/**
 * @fileoverview Category display utilities for suggestion categories
 * @module utils/categoryDisplay
 * @author WordWise.ai Team
 * 
 * Dependencies: Suggestion types
 * Usage: Convert raw category values into user-friendly display names
 */

export type StyleCategory = 'clarity' | 'conciseness' | 'tone' | 'formality' | 'word-choice';
export type ReadabilityMetric = 'sentence-length' | 'word-complexity' | 'paragraph-structure' | 'transitions';
export type GrammarCategory = 'verb-tense' | 'subject-verb-agreement' | 'article-usage' | 'preposition' | 'punctuation' | 'sentence-structure' | 'word-order' | 'general';

/**
 * Category display configuration
 */
interface CategoryDisplay {
  label: string;
  description: string;
  shortLabel?: string;
}

/**
 * Style category display mappings
 */
const STYLE_CATEGORY_DISPLAY: Record<StyleCategory, CategoryDisplay> = {
  'clarity': {
    label: 'Clarity Improvement',
    description: 'Make your writing clearer and easier to understand',
    shortLabel: 'Clarity'
  },
  'conciseness': {
    label: 'Conciseness Enhancement',
    description: 'Remove unnecessary words and improve brevity',
    shortLabel: 'Conciseness'
  },
  'tone': {
    label: 'Tone Adjustment',
    description: 'Improve the tone and voice of your writing',
    shortLabel: 'Tone'
  },
  'formality': {
    label: 'Formality Enhancement',
    description: 'Adjust formality level for academic writing',
    shortLabel: 'Formality'
  },
  'word-choice': {
    label: 'Word Choice Improvement',
    description: 'Use more precise and effective vocabulary',
    shortLabel: 'Word Choice'
  }
};

/**
 * Readability metric display mappings
 */
const READABILITY_METRIC_DISPLAY: Record<ReadabilityMetric, CategoryDisplay> = {
  'sentence-length': {
    label: 'Sentence Length Optimization',
    description: 'Improve sentence length for better readability',
    shortLabel: 'Sentence Length'
  },
  'word-complexity': {
    label: 'Word Complexity Reduction',
    description: 'Simplify complex words for easier comprehension',
    shortLabel: 'Word Complexity'
  },
  'paragraph-structure': {
    label: 'Paragraph Structure Enhancement',
    description: 'Improve paragraph organization and flow',
    shortLabel: 'Paragraph Structure'
  },
  'transitions': {
    label: 'Transition Improvement',
    description: 'Add better transitions between ideas',
    shortLabel: 'Transitions'
  }
};

/**
 * Grammar category display mappings
 */
const GRAMMAR_CATEGORY_DISPLAY: Record<string, CategoryDisplay> = {
  'verb-tense': {
    label: 'Verb Tense Correction',
    description: 'Fix verb tense consistency and accuracy',
    shortLabel: 'Verb Tense'
  },
  'subject-verb-agreement': {
    label: 'Subject-Verb Agreement',
    description: 'Ensure subjects and verbs agree in number',
    shortLabel: 'Agreement'
  },
  'article-usage': {
    label: 'Article Usage Correction',
    description: 'Proper use of a, an, and the',
    shortLabel: 'Articles'
  },
  'preposition': {
    label: 'Preposition Correction',
    description: 'Fix preposition usage and placement',
    shortLabel: 'Prepositions'
  },
  'punctuation': {
    label: 'Punctuation Correction',
    description: 'Fix punctuation marks and placement',
    shortLabel: 'Punctuation'
  },
  'sentence-structure': {
    label: 'Sentence Structure Fix',
    description: 'Improve sentence construction and grammar',
    shortLabel: 'Structure'
  },
  'word-order': {
    label: 'Word Order Correction',
    description: 'Fix word arrangement within sentences',
    shortLabel: 'Word Order'
  },
  'general': {
    label: 'Grammar Correction',
    description: 'General grammar improvement',
    shortLabel: 'Grammar'
  }
};

/**
 * Get display information for a style category
 */
export function getStyleCategoryDisplay(category: string): CategoryDisplay {
  return STYLE_CATEGORY_DISPLAY[category as StyleCategory] || {
    label: 'Style Improvement',
    description: 'General style enhancement',
    shortLabel: 'Style'
  };
}

/**
 * Get display information for a readability metric
 */
export function getReadabilityMetricDisplay(metric: string): CategoryDisplay {
  return READABILITY_METRIC_DISPLAY[metric as ReadabilityMetric] || {
    label: 'Readability Improvement',
    description: 'General readability enhancement',
    shortLabel: 'Readability'
  };
}

/**
 * Get display information for a grammar category
 */
export function getGrammarCategoryDisplay(category: string): CategoryDisplay {
  return GRAMMAR_CATEGORY_DISPLAY[category] || {
    label: 'Grammar Correction',
    description: 'General grammar improvement',
    shortLabel: 'Grammar'
  };
}

/**
 * Get the appropriate display label based on suggestion type and category
 */
export function getSuggestionCategoryDisplay(
  type: 'grammar' | 'style' | 'readability',
  category: string,
  useShortLabel: boolean = false
): string {
  let display: CategoryDisplay;
  
  switch (type) {
    case 'style':
      display = getStyleCategoryDisplay(category);
      break;
    case 'readability':
      display = getReadabilityMetricDisplay(category);
      break;
    case 'grammar':
      display = getGrammarCategoryDisplay(category);
      break;
    default:
      return category;
  }
  
  return useShortLabel && display.shortLabel ? display.shortLabel : display.label;
}

/**
 * Get description for a suggestion category
 */
export function getSuggestionCategoryDescription(
  type: 'grammar' | 'style' | 'readability',
  category: string
): string {
  switch (type) {
    case 'style':
      return getStyleCategoryDisplay(category).description;
    case 'readability':
      return getReadabilityMetricDisplay(category).description;
    case 'grammar':
      return getGrammarCategoryDisplay(category).description;
    default:
      return '';
  }
}

/**
 * @fileoverview Utility functions for displaying suggestion categories and document-specific categories
 * @module utils/categoryDisplay
 * 
 * Dependencies: None
 * Usage: Display helpers for suggestion categories, types, and document-specific writing guidance
 */

/**
 * Document-specific category descriptions for user-friendly display
 */
export const DOCUMENT_SPECIFIC_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  // Creative Writing Categories
  'character-voice-consistency': 'Maintain consistent character voice and personality throughout the narrative',
  'dialogue-authenticity': 'Make dialogue sound natural and advance the story effectively',
  'show-vs-tell': 'Use concrete details and actions instead of abstract statements',
  'sensory-details': 'Include sensory descriptions to immerse readers in the scene',
  'pacing-rhythm': 'Control the speed and flow of your narrative for maximum impact',
  'point-of-view-consistency': 'Maintain consistent narrative perspective throughout',
  'dialogue-punctuation': 'Use proper punctuation for dialogue and internal thoughts',
  'narrative-tense-consistency': 'Keep consistent verb tense throughout the story',
  'creative-fragments': 'Use sentence fragments effectively for stylistic impact',
  'internal-thought-formatting': 'Format character thoughts clearly and consistently',
  'scene-transitions': 'Create smooth transitions between scenes and chapters',
  'hook-effectiveness': 'Craft compelling openings that draw readers in',
  'conflict-escalation': 'Build tension and conflict effectively throughout the story',
  'resolution-pacing': 'Resolve conflicts with appropriate pacing and satisfaction',

  // Academic Writing Categories
  'thesis-clarity': 'Develop clear, arguable thesis statements',
  'argument-structure': 'Organize arguments logically with strong supporting evidence',
  'citation-integration': 'Integrate sources smoothly into your academic writing',
  'objective-tone': 'Maintain scholarly, objective tone throughout',
  'idea-transitions': 'Create smooth transitions between concepts and paragraphs',
  'evidence-analysis': 'Analyze evidence thoroughly to support your claims',
  'academic-voice': 'Use appropriate academic language and avoid first person',
  'research-tense-usage': 'Use correct verb tenses when discussing research',
  'conditional-language': 'Use appropriate qualifying language for academic claims',
  'passive-voice-appropriateness': 'Use passive voice appropriately in academic contexts',
  'introduction-effectiveness': 'Write compelling introductions that set up your argument',
  'paragraph-unity': 'Ensure each paragraph focuses on a single main idea',
  'conclusion-strength': 'Create strong conclusions that synthesize your argument',
  'section-organization': 'Organize sections logically for maximum clarity',

  // Business Writing Categories
  'professional-tone': 'Maintain appropriate professional tone for your audience',
  'action-oriented-language': 'Use language that focuses on results and actions',
  'conciseness-optimization': 'Express ideas clearly and concisely without losing meaning',
  'stakeholder-appropriate-formality': 'Match formality level to your audience',
  'call-to-action-clarity': 'Include clear, specific calls to action',
  'executive-summary-effectiveness': 'Write executive summaries that capture key points',
  'active-voice-preference': 'Use active voice for authority and clarity',
  'email-conventions': 'Follow proper business email formatting and etiquette',
  'parallel-structure': 'Use parallel structure in lists and bullet points',
  'business-punctuation': 'Apply business writing punctuation conventions',
  'key-points-prominence': 'Make important information easy to find and understand',
  'professional-formatting': 'Use professional formatting standards',
  'logical-flow': 'Organize information to support business objectives',
  'audience-focus': 'Keep content focused on audience needs and interests',

  // Script Writing Categories
  'character-voice-differentiation': 'Give each character a distinct voice and speaking style',
  'dialogue-naturalism': 'Write dialogue that sounds realistic and serves the story',
  'stage-direction-clarity': 'Write clear, concise stage directions and action lines',
  'action-line-efficiency': 'Keep action descriptions brief and visual',
  'subtext-development': 'Layer meaning beneath surface dialogue',
  'script-formatting': 'Follow industry-standard script formatting conventions',
  'present-tense-consistency': 'Use present tense consistently in action descriptions',
  'character-name-consistency': 'Keep character names and formatting consistent',
  'action-description-style': 'Write action descriptions that are visual and actable',
  'scene-setup': 'Establish scenes efficiently and clearly',
  'dialogue-action-balance': 'Balance dialogue with action and visual elements',
  'character-introduction-timing': 'Introduce characters at the right dramatic moments',
  'dramatic-pacing': 'Control pacing to build tension and maintain interest',

  // Email Writing Categories
  'subject-line-clarity': 'Write clear, specific subject lines that convey purpose',
  'opening-appropriateness': 'Use appropriate greetings for your relationship with recipient',
  'message-conciseness': 'Keep messages brief while including necessary information',
  'closing-professionalism': 'Use appropriate professional closings',
  'tone-appropriateness': 'Match tone to context and relationship',
  'email-punctuation': 'Use proper punctuation for email communication',
  'salutation-format': 'Format greetings and closings correctly',
  'signature-format': 'Include appropriate signature information',
  'attachment-references': 'Reference attachments clearly in the message',
  'information-hierarchy': 'Organize information with most important points first',
  'action-items-clarity': 'Make action items and deadlines crystal clear',
  'response-requirements': 'Clearly indicate what response is needed',
  'professional-formatting-email': 'Use professional email formatting standards',

  // Essay Writing Categories
  'thesis-development': 'Develop strong, arguable thesis statements',
  'argument-clarity': 'Present arguments clearly and persuasively',
  'evidence-presentation': 'Present evidence effectively to support claims',
  'persuasive-techniques': 'Use appropriate rhetorical techniques for persuasion',
  'counter-argument-handling': 'Address opposing viewpoints fairly and thoroughly',
  'formal-essay-tone': 'Maintain appropriate formal tone throughout',
  'complex-sentence-structure': 'Use varied sentence structures for sophistication',
  'transition-words': 'Use effective transitions to connect ideas',
  'pronoun-consistency': 'Maintain consistent pronoun usage',
  'introduction-hook': 'Create compelling hooks that engage readers',
  'body-paragraph-organization': 'Organize body paragraphs for maximum impact',
  'conclusion-impact': 'Write memorable conclusions that reinforce your argument',
  'overall-coherence': 'Ensure overall coherence and logical flow',

  // General Writing Categories
  'clarity-improvement': 'Improve overall clarity and communication effectiveness',
  'word-choice-precision': 'Choose precise, appropriate vocabulary',
  'sentence-variety': 'Use varied sentence structures for better flow',
  'tone-consistency': 'Maintain consistent tone throughout the piece',
  'audience-awareness': 'Write with your specific audience in mind',
  'basic-grammar-rules': 'Follow fundamental grammar rules',
  'sentence-structure': 'Construct clear, well-formed sentences',
  'punctuation-usage': 'Use punctuation correctly and effectively',
  'verb-agreement': 'Ensure proper subject-verb agreement',
  'paragraph-organization': 'Organize paragraphs logically and coherently',
  'logical-flow-general': 'Create logical flow between ideas and sections',
  'introduction-conclusion': 'Write effective introductions and conclusions',
  'supporting-details': 'Include adequate supporting details and examples'
};

/**
 * Get a user-friendly description for a document-specific category
 * 
 * @param documentSpecificCategory - The specific category from AI analysis
 * @returns User-friendly description of the category
 */
export function getDocumentSpecificCategoryDescription(documentSpecificCategory?: string): string {
  if (!documentSpecificCategory) return '';
  
  return DOCUMENT_SPECIFIC_CATEGORY_DESCRIPTIONS[documentSpecificCategory] || 'Writing improvement suggestion';
}

/**
 * Get a formatted display name for a document-specific category
 * 
 * @param documentSpecificCategory - The specific category from AI analysis
 * @returns Formatted display name
 */
export function getDocumentSpecificCategoryDisplayName(documentSpecificCategory?: string): string {
  if (!documentSpecificCategory) return '';
  
  // Convert kebab-case to Title Case
  return documentSpecificCategory
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} 
