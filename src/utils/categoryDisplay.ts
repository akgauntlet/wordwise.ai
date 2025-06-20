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
