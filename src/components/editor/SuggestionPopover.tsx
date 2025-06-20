/**
 * @fileoverview Suggestion popover component
 * @module components/editor/SuggestionPopover
 * 
 * Dependencies: React, UI components, Suggestion types
 * Usage: Shows detailed suggestion information with accept/reject actions
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  AlertCircle, 
  Lightbulb, 
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { WritingSuggestion } from './SuggestionExtension';

/**
 * Suggestion popover props
 */
interface SuggestionPopoverProps {
  /** The suggestion to display */
  suggestion: WritingSuggestion | null;
  /** Whether the popover is visible */
  isVisible: boolean;
  /** Position of the popover */
  position?: { x: number; y: number };
  /** Callback when suggestion is accepted */
  onAccept: (suggestion: WritingSuggestion) => void;
  /** Callback when suggestion is rejected */
  onReject: (suggestion: WritingSuggestion) => void;
  /** Callback when popover should be closed */
  onClose: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get icon for suggestion type
 */
function getSuggestionIcon(type: WritingSuggestion['type']) {
  switch (type) {
    case 'grammar':
      return AlertCircle;
    case 'style':
      return Lightbulb;
    case 'readability':
      return BookOpen;
    default:
      return AlertCircle;
  }
}

/**
 * Get color scheme for suggestion type
 */
function getSuggestionColors(type: WritingSuggestion['type']) {
  switch (type) {
    case 'grammar':
      return {
        badge: 'bg-red-100 text-red-800 border-red-200',
        border: 'border-red-200',
        icon: 'text-red-600',
        button: 'bg-red-600 hover:bg-red-700'
      };
    case 'style':
      return {
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        border: 'border-amber-200',
        icon: 'text-amber-600',
        button: 'bg-amber-600 hover:bg-amber-700'
      };
    case 'readability':
      return {
        badge: 'bg-green-100 text-green-800 border-green-200',
        border: 'border-green-200',
        icon: 'text-green-600',
        button: 'bg-green-600 hover:bg-green-700'
      };
    default:
      return {
        badge: 'bg-gray-100 text-gray-800 border-gray-200',
        border: 'border-gray-200',
        icon: 'text-gray-600',
        button: 'bg-gray-600 hover:bg-gray-700'
      };
  }
}

/**
 * Suggestion popover component
 * 
 * Displays detailed information about a writing suggestion with options
 * to accept or reject the suggestion.
 */
export function SuggestionPopover({
  suggestion,
  isVisible,
  position = { x: 0, y: 0 },
  onAccept,
  onReject,
  onClose,
  className = ''
}: SuggestionPopoverProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isVisible && !target.closest('.suggestion-popover')) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onClose]);

  if (!isVisible || !suggestion) {
    return null;
  }

  const Icon = getSuggestionIcon(suggestion.type);
  const colors = getSuggestionColors(suggestion.type);

  /**
   * Handle accepting the suggestion
   */
  const handleAccept = () => {
    onAccept(suggestion);
    onClose();
  };

  /**
   * Handle rejecting the suggestion
   */
  const handleReject = () => {
    onReject(suggestion);
    onClose();
  };

  /**
   * Get additional details for grammar suggestions
   */
  const getGrammarDetails = (suggestion: WritingSuggestion) => {
    if (suggestion.type === 'grammar') {
      const grammarSuggestion = suggestion as any; // Type assertion for additional properties
      if (grammarSuggestion.grammarRule) {
        return (
          <div className="mt-3 pt-3 border-t border-neutral-200">
            <p className="text-sm font-medium text-neutral-700 mb-1">
              Grammar Rule: {grammarSuggestion.grammarRule}
            </p>
            {grammarSuggestion.eslExplanation && (
              <p className="text-sm text-neutral-600">
                {grammarSuggestion.eslExplanation}
              </p>
            )}
          </div>
        );
      }
    }
    return null;
  };

  /**
   * Get additional details for style suggestions
   */
  const getStyleDetails = (suggestion: WritingSuggestion) => {
    if (suggestion.type === 'style') {
      const styleSuggestion = suggestion as any; // Type assertion for additional properties
      if (styleSuggestion.styleCategory) {
        return (
          <div className="mt-3 pt-3 border-t border-neutral-200">
            <p className="text-sm font-medium text-neutral-700 mb-1">
              Style Category: {styleSuggestion.styleCategory}
            </p>
            {styleSuggestion.impact && (
              <p className="text-sm text-neutral-600">
                Impact: {styleSuggestion.impact}
              </p>
            )}
          </div>
        );
      }
    }
    return null;
  };

  /**
   * Get additional details for readability suggestions
   */
  const getReadabilityDetails = (suggestion: WritingSuggestion) => {
    if (suggestion.type === 'readability') {
      const readabilitySuggestion = suggestion as any; // Type assertion for additional properties
      if (readabilitySuggestion.metric || readabilitySuggestion.targetLevel) {
        return (
          <div className="mt-3 pt-3 border-t border-neutral-200">
            {readabilitySuggestion.metric && (
              <p className="text-sm font-medium text-neutral-700 mb-1">
                Metric: {readabilitySuggestion.metric}
              </p>
            )}
            {readabilitySuggestion.targetLevel && (
              <p className="text-sm text-neutral-600">
                Target Level: {readabilitySuggestion.targetLevel}
              </p>
            )}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div
      className={`suggestion-popover fixed z-50 ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <Card className={`w-80 shadow-lg ${colors.border} animate-in fade-in-0 zoom-in-95 duration-200`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${colors.icon}`} />
              <CardTitle className="text-base font-semibold capitalize">
                {suggestion.type} Suggestion
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${colors.badge}`}
              >
                {suggestion.severity}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-sm mt-2">
            {suggestion.category}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Original and suggested text */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-1">Original:</p>
              <p className="text-sm bg-neutral-50 rounded px-2 py-1 border">
                "{suggestion.originalText}"
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-1">Suggested:</p>
              <p className="text-sm bg-success-50 rounded px-2 py-1 border border-success-200">
                "{suggestion.suggestedText}"
              </p>
            </div>
          </div>

          {/* Explanation */}
          <div className="mt-4">
            <p className="text-sm text-neutral-700">
              {suggestion.explanation}
            </p>
          </div>

          {/* Additional details */}
          {showDetails && (
            <div>
              {suggestion.type === 'grammar' && getGrammarDetails(suggestion)}
              {suggestion.type === 'style' && getStyleDetails(suggestion)}
              {suggestion.type === 'readability' && getReadabilityDetails(suggestion)}
              
              {/* Confidence score */}
              <div className="mt-3 pt-3 border-t border-neutral-200">
                <p className="text-sm text-neutral-600">
                  Confidence: {Math.round(suggestion.confidence * 100)}%
                </p>
              </div>
            </div>
          )}

          {/* Toggle details button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full mt-3 text-xs text-neutral-600 hover:text-neutral-800"
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show Details
              </>
            )}
          </Button>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleAccept}
              className={`flex-1 text-white ${colors.button}`}
              size="sm"
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              onClick={handleReject}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
