/**
 * @fileoverview Suggestion sidebar component
 * @module components/editor/SuggestionSidebar
 * 
 * Dependencies: React, UI components, Suggestion types
 * Usage: Displays categorized suggestions with tabs and bulk actions in the editor sidebar
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSuggestionCategoryDisplay, getDocumentSpecificCategoryDisplayName, getDocumentSpecificCategoryDescription } from '@/lib/utils';
import { 
  BookOpen, 
  Pen, 
  BarChart3,
  Check,
  X,
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
  icon: typeof BookOpen;
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
    icon: BookOpen,
    color: 'error',
    description: 'Grammar rules and corrections'
  },
  {
    type: 'style',
    title: 'Style',
    icon: Pen,
    color: 'primary',
    description: 'Writing style improvements'
  },
  {
    type: 'readability',
    title: 'Readability',
    icon: BarChart3,
    color: 'success',
    description: 'Text clarity and readability'
  }
];

/**
 * Get color classes for suggestion type
 */
function getCategoryColors(color: string) {
  const colorMap = {
    primary: {
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      tab: 'text-blue-600 border-blue-500',
      tabActive: 'bg-blue-50 text-blue-700 border-blue-500',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    error: {
      badge: 'bg-red-100 text-red-800 border-red-200',
      tab: 'text-red-600 border-red-500',
      tabActive: 'bg-red-50 text-red-700 border-red-500',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      tab: 'text-yellow-600 border-yellow-500',
      tabActive: 'bg-yellow-50 text-yellow-700 border-yellow-500',
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    success: {
      badge: 'bg-green-100 text-green-800 border-green-200',
      tab: 'text-green-600 border-green-500',
      tabActive: 'bg-green-50 text-green-700 border-green-500',
      icon: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700'
    }
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.error;
}

/**
 * Get severity-based badge styling
 */
function getSeverityBadgeClass(severity: string) {
  const severityMap = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };
  return severityMap[severity.toLowerCase() as keyof typeof severityMap] || 'bg-neutral-100 text-neutral-800 border-neutral-200';
}

/**
 * Individual suggestion item component
 */
function SuggestionItem({
  suggestion,
  onAccept,
  onReject
}: {
  suggestion: WritingSuggestion;
  onAccept: (suggestion: WritingSuggestion) => void;
  onReject: (suggestion: WritingSuggestion) => void;
}) {
  const hasDocumentSpecificCategory = suggestion.documentSpecificCategory;
  const documentSpecificDisplayName = hasDocumentSpecificCategory 
    ? getDocumentSpecificCategoryDisplayName(suggestion.documentSpecificCategory)
    : null;
  const documentSpecificDescription = hasDocumentSpecificCategory 
    ? getDocumentSpecificCategoryDescription(suggestion.documentSpecificCategory)
    : null;

  // Check if suggestion has document-specific guidance

  return (
    <div className="border rounded-lg p-4 space-y-3 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 hover:shadow-sm">
      {/* Suggestion header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 text-left">
          <div className="text-sm font-semibold text-neutral-800">
            {hasDocumentSpecificCategory 
              ? documentSpecificDisplayName 
              : getSuggestionCategoryDisplay(suggestion.type, suggestion.category)
            }
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={`ml-2 text-xs font-medium ${getSeverityBadgeClass(suggestion.severity)}`}
        >
          {suggestion.severity.charAt(0).toUpperCase() + suggestion.severity.slice(1)}
        </Badge>
      </div>

      {/* Document-specific description (if available) */}
      {hasDocumentSpecificCategory && documentSpecificDescription && (
        <div className="bg-blue-50 border-l-4 border-blue-200 p-2 rounded-r mt-3">
          <p className="text-xs text-blue-800 font-medium mb-1">{documentSpecificDescription}</p>
          <p className="text-xs text-blue-700">
            {suggestion.explanation}
          </p>
        </div>
      )}

      {/* Explanation (fallback for non-document-specific) */}
      {!(hasDocumentSpecificCategory && documentSpecificDescription) && (
        <p className="text-xs text-neutral-600 line-clamp-2">
          <span className="font-semibold">Explanation: </span>
          {suggestion.explanation}
        </p>
      )}

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
          <span className="ml-1 bg-green-100 px-1 rounded">
            "{suggestion.suggestedText}"
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        <Button
          onClick={() => onAccept(suggestion)}
          size="sm"
          className="flex-1 h-8 text-xs font-medium bg-green-600 hover:bg-green-700 text-white border-green-600"
          variant="default"
        >
          <Check className="h-3 w-3 mr-1" />
          Accept
        </Button>
        <Button
          onClick={() => onReject(suggestion)}
          size="sm"
          className="flex-1 h-8 text-xs font-medium border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400"
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
 * Tab navigation component
 */
function TabNavigation({
  categories,
  activeTab,
  suggestionCounts,
  onTabChange
}: {
  categories: SuggestionCategory[];
  activeTab: WritingSuggestion['type'];
  suggestionCounts: Record<WritingSuggestion['type'], number>;
  onTabChange: (type: WritingSuggestion['type']) => void;
}) {
  return (
    <div className="border-b border-neutral-200">
      <nav className="flex">
        {categories.map((category) => {
          const Icon = category.icon;
          const colors = getCategoryColors(category.color);
          const count = suggestionCounts[category.type] || 0;
          const isActive = activeTab === category.type;
          
          return (
            <button
              key={category.type}
              onClick={() => onTabChange(category.type)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors
                ${isActive 
                  ? `${colors.tabActive} border-current` 
                  : 'text-neutral-600 border-transparent hover:text-neutral-800 hover:border-neutral-300'
                }
              `}
            >
              <div className={`flex items-center gap-2 ${
                category.type === 'style' ? '-ml-3' : 
                category.type === 'grammar' ? '-ml-1' : ''
              }`}>
                <Icon className={`h-4 w-4 ${isActive ? colors.icon : 'text-neutral-400'}`} />
                <span>{category.title}</span>
              </div>
              {count > 0 && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${isActive ? colors.badge : 'bg-neutral-100 text-neutral-600'}`}
                >
                  {count}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/**
 * Tab content component
 */
function TabContent({
  category,
  suggestions,
  onAcceptSuggestion,
  onRejectSuggestion,
  onAcceptAll,
  onRejectAll,
  isAnalyzing
}: {
  category: SuggestionCategory;
  suggestions: WritingSuggestion[];
  onAcceptSuggestion: (suggestion: WritingSuggestion) => void;
  onRejectSuggestion: (suggestion: WritingSuggestion) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  isAnalyzing: boolean;
}) {
  const colors = getCategoryColors(category.color);
  const count = suggestions.length;

  if (count === 0) {
    return (
      <div className="text-center py-8">
        <CheckCheck className={`h-8 w-8 mx-auto mb-2 ${colors.icon}`} />
        <h3 className="text-sm font-medium text-neutral-800 mb-1">
          No {category.title.toLowerCase()} issues
        </h3>
        <p className="text-sm text-neutral-600">
          {isAnalyzing 
            ? 'Analysis in progress...' 
            : `Your ${category.title.toLowerCase()} looks good!`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions */}
      {count > 1 && (
        <div className="flex gap-2">
          <Button
            onClick={onAcceptAll}
            size="sm"
            variant="outline"
            className="flex-1 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600"
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

      {/* Suggestion list */}
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <SuggestionItem
            key={suggestion.id}
            suggestion={suggestion}
            onAccept={onAcceptSuggestion}
            onReject={onRejectSuggestion}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Suggestion sidebar component
 * 
 * Displays categorized writing suggestions with tabs and bulk actions
 * in the editor sidebar.
 */
export function SuggestionSidebar({
  suggestions,
  isAnalyzing = false,
  onAcceptSuggestion,
  onRejectSuggestion,
  onAcceptAllType,
  onRejectAllType,
  className = ''
}: SuggestionSidebarProps) {
  const [activeTab, setActiveTab] = useState<WritingSuggestion['type']>('grammar');

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
   * Get suggestion counts by type
   */
  const suggestionCounts = SUGGESTION_CATEGORIES.reduce((acc, category) => {
    acc[category.type] = suggestionsByType[category.type]?.length || 0;
    return acc;
  }, {} as Record<WritingSuggestion['type'], number>);

  /**
   * Get total suggestion count
   */
  const totalSuggestions = suggestions.length;

  /**
   * Get active category
   */
  const activeCategory = SUGGESTION_CATEGORIES.find(cat => cat.type === activeTab)!;
  const activeSuggestions = suggestionsByType[activeTab] || [];

  return (
    <aside className={`
      fixed right-0 top-0 w-[450px] h-screen bg-background border-l border-border z-30 flex flex-col
      transition-transform duration-300 ease-in-out
      ${className}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-800">
              Writing Suggestions
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              {totalSuggestions} suggestion{totalSuggestions !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation
        categories={SUGGESTION_CATEGORIES}
        activeTab={activeTab}
        suggestionCounts={suggestionCounts}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <TabContent
          category={activeCategory}
          suggestions={activeSuggestions}
          onAcceptSuggestion={onAcceptSuggestion}
          onRejectSuggestion={onRejectSuggestion}
          onAcceptAll={() => onAcceptAllType(activeTab)}
          onRejectAll={() => onRejectAllType(activeTab)}
          isAnalyzing={isAnalyzing}
        />
      </div>
    </aside>
  );
} 
