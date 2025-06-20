/**
 * @fileoverview Suggestion sidebar component
 * @module components/editor/SuggestionSidebar
 * 
 * Dependencies: React, UI components, Suggestion types
 * Usage: Displays categorized suggestions with bulk actions in the editor sidebar
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { 
  AlertCircle, 
  Lightbulb, 
  BookOpen,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  CheckCheck
} from 'lucide-react';
import type { WritingSuggestion } from './SuggestionExtension';

/**
 * Suggestion sidebar props
 */
interface SuggestionSidebarProps {
  /** Array of all suggestions */
  suggestions: WritingSuggestion[];
  /** Whether suggestions are currently being analyzed */
  isAnalyzing?: boolean;
  /** Callback when a suggestion is clicked */
  onSuggestionClick: (suggestion: WritingSuggestion) => void;
  /** Callback when a suggestion is accepted */
  onAcceptSuggestion: (suggestion: WritingSuggestion) => void;
  /** Callback when a suggestion is rejected */
  onRejectSuggestion: (suggestion: WritingSuggestion) => void;
  /** Callback when all suggestions of a type are accepted */
  onAcceptAllType: (type: WritingSuggestion['type']) => void;
  /** Callback when all suggestions of a type are rejected */
  onRejectAllType: (type: WritingSuggestion['type']) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Suggestion category configuration
 */
interface SuggestionCategory {
  type: WritingSuggestion['type'];
  title: string;
  icon: typeof AlertCircle;
  color: string;
  description: string;
}

/**
 * Suggestion categories configuration
 */
const SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  {
    type: 'grammar',
    title: 'Grammar',
    icon: AlertCircle,
    color: 'error',
    description: 'Grammar rules and corrections'
  },
  {
    type: 'style',
    title: 'Style',
    icon: Lightbulb,
    color: 'warning',
    description: 'Writing style improvements'
  },
  {
    type: 'readability',
    title: 'Readability',
    icon: BookOpen,
    color: 'success',
    description: 'Text clarity and readability'
  }
];

/**
 * Get color classes for suggestion type
 */
function getCategoryColors(color: string) {
  const colorMap = {
    error: {
      badge: 'bg-error-100 text-error-800 border-error-200',
      header: 'text-error-800',
      icon: 'text-error-600',
      button: 'bg-error-600 hover:bg-error-700',
      border: 'border-error-200'
    },
    warning: {
      badge: 'bg-warning-100 text-warning-800 border-warning-200',
      header: 'text-warning-800',
      icon: 'text-warning-600',
      button: 'bg-warning-600 hover:bg-warning-700',
      border: 'border-warning-200'
    },
    success: {
      badge: 'bg-success-100 text-success-800 border-success-200',
      header: 'text-success-800',
      icon: 'text-success-600',
      button: 'bg-success-600 hover:bg-success-700',
      border: 'border-success-200'
    }
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.error;
}

/**
 * Individual suggestion item component
 */
function SuggestionItem({
  suggestion,
  onSuggestionClick,
  onAccept,
  onReject
}: {
  suggestion: WritingSuggestion;
  onSuggestionClick: (suggestion: WritingSuggestion) => void;
  onAccept: (suggestion: WritingSuggestion) => void;
  onReject: (suggestion: WritingSuggestion) => void;
}) {
  return (
    <div className="border rounded-lg p-3 space-y-2 hover:bg-neutral-50 transition-colors">
      {/* Suggestion header */}
      <div className="flex items-start justify-between">
        <button
          onClick={() => onSuggestionClick(suggestion)}
          className="flex-1 text-left text-sm font-medium text-neutral-800 hover:text-primary-600 transition-colors"
        >
          {suggestion.category}
        </button>
        <Badge 
          variant="outline" 
          className="ml-2 text-xs"
        >
          {suggestion.severity}
        </Badge>
      </div>

      {/* Original and suggested text */}
      <div className="space-y-1 text-xs">
        <div>
          <span className="text-neutral-500">From:</span>
          <span className="ml-1 bg-neutral-100 px-1 rounded">
            "{suggestion.originalText}"
          </span>
        </div>
        <div>
          <span className="text-neutral-500">To:</span>
          <span className="ml-1 bg-success-100 px-1 rounded">
            "{suggestion.suggestedText}"
          </span>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-xs text-neutral-600 line-clamp-2">
        {suggestion.explanation}
      </p>

      {/* Action buttons */}
      <div className="flex gap-1">
        <Button
          onClick={() => onAccept(suggestion)}
          size="sm"
          className="flex-1 h-7 text-xs"
          variant="default"
        >
          <Check className="h-3 w-3 mr-1" />
          Accept
        </Button>
        <Button
          onClick={() => onReject(suggestion)}
          size="sm"
          className="flex-1 h-7 text-xs"
          variant="outline"
        >
          <X className="h-3 w-3 mr-1" />
          Reject
        </Button>
      </div>
    </div>
  );
}

/**
 * Suggestion category section component
 */
function SuggestionCategorySection({
  category,
  suggestions,
  isExpanded,
  onToggleExpanded,
  onSuggestionClick,
  onAcceptSuggestion,
  onRejectSuggestion,
  onAcceptAll,
  onRejectAll
}: {
  category: SuggestionCategory;
  suggestions: WritingSuggestion[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onSuggestionClick: (suggestion: WritingSuggestion) => void;
  onAcceptSuggestion: (suggestion: WritingSuggestion) => void;
  onRejectSuggestion: (suggestion: WritingSuggestion) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}) {
  const Icon = category.icon;
  const colors = getCategoryColors(category.color);
  const count = suggestions.length;

  if (count === 0) {
    return null;
  }

  return (
    <Card className={`${colors.border} border-l-4`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onToggleExpanded}
            className="flex items-center gap-2 flex-1 text-left"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-neutral-400" />
            )}
            <Icon className={`h-4 w-4 ${colors.icon}`} />
            <CardTitle className={`text-base font-semibold ${colors.header}`}>
              {category.title}
            </CardTitle>
            <Badge 
              variant="outline" 
              className={`ml-2 ${colors.badge}`}
            >
              {count}
            </Badge>
          </button>
        </div>
        <CardDescription className="text-sm">
          {category.description}
        </CardDescription>

        {/* Bulk actions */}
        {isExpanded && count > 1 && (
          <div className="flex gap-2 mt-3">
            <Button
              onClick={onAcceptAll}
              size="sm"
              className={`flex-1 text-white ${colors.button}`}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Accept All ({count})
            </Button>
            <Button
              onClick={onRejectAll}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <X className="h-3 w-3 mr-1" />
              Reject All
            </Button>
          </div>
        )}
      </CardHeader>

      {/* Suggestion list */}
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <SuggestionItem
                key={suggestion.id}
                suggestion={suggestion}
                onSuggestionClick={onSuggestionClick}
                onAccept={onAcceptSuggestion}
                onReject={onRejectSuggestion}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Suggestion sidebar component
 * 
 * Displays categorized writing suggestions with bulk actions and individual
 * suggestion management in the editor sidebar.
 */
export function SuggestionSidebar({
  suggestions,
  isAnalyzing = false,
  onSuggestionClick,
  onAcceptSuggestion,
  onRejectSuggestion,
  onAcceptAllType,
  onRejectAllType,
  className = ''
}: SuggestionSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['grammar', 'style', 'readability'])
  );

  /**
   * Group suggestions by type
   */
  const suggestionsByType = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.type]) {
      acc[suggestion.type] = [];
    }
    acc[suggestion.type].push(suggestion);
    return acc;
  }, {} as Record<WritingSuggestion['type'], WritingSuggestion[]>);

  /**
   * Toggle section expansion
   */
  const toggleSection = (type: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedSections(newExpanded);
  };

  /**
   * Get total suggestion count
   */
  const totalSuggestions = suggestions.length;

  return (
    <div className={`w-80 bg-neutral-50 border-l border-neutral-200 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-800">
            Writing Suggestions
          </h2>
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" />
              Analyzing...
            </div>
          )}
        </div>
        
        {totalSuggestions > 0 && (
          <p className="text-sm text-neutral-600 mt-1">
            {totalSuggestions} suggestion{totalSuggestions !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {totalSuggestions === 0 ? (
          <div className="text-center py-8">
            <CheckCheck className="h-8 w-8 text-success-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-neutral-800 mb-1">
              Great writing!
            </h3>
            <p className="text-sm text-neutral-600">
              {isAnalyzing 
                ? 'Analysis in progress...' 
                : 'No suggestions found. Your writing looks good!'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {SUGGESTION_CATEGORIES.map((category) => {
              const categorySuggestions = suggestionsByType[category.type] || [];
              return (
                <SuggestionCategorySection
                  key={category.type}
                  category={category}
                  suggestions={categorySuggestions}
                  isExpanded={expandedSections.has(category.type)}
                  onToggleExpanded={() => toggleSection(category.type)}
                  onSuggestionClick={onSuggestionClick}
                  onAcceptSuggestion={onAcceptSuggestion}
                  onRejectSuggestion={onRejectSuggestion}
                  onAcceptAll={() => onAcceptAllType(category.type)}
                  onRejectAll={() => onRejectAllType(category.type)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 
