/**
 * @fileoverview Suggestion popover component
 * @module components/editor/SuggestionPopover
 * 
 * Dependencies: React, UI components, Suggestion types
 * Usage: Shows detailed suggestion information with accept/reject actions
 */

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  BookOpen, 
  Pen, 
  BarChart3
} from 'lucide-react';
import { getSuggestionCategoryDisplay } from '@/lib/utils';
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
      return BookOpen;
    case 'style':
      return Pen;
    case 'readability':
      return BarChart3;
    default:
      return BookOpen;
  }
}

/**
 * Get color scheme for suggestion type
 * Colors match the editor suggestion styling: red for grammar, blue for style
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
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700'
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



  return (
    <div
      className={`suggestion-popover fixed z-50 ${className}`}
      style={{
        left: `${position.x - 160}px`, // Center horizontally (half of w-80 = 160px)
        top: `${position.y}px`,
      }}
    >
      <Card className="w-80 shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${colors.icon}`} />
              <CardTitle className="text-base font-semibold">
                {getSuggestionCategoryDisplay(suggestion.type, suggestion.category)}
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
              <p className="text-sm bg-green-50 rounded px-2 py-1 border border-green-200">
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
