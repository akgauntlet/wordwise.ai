/**
 * @fileoverview Real-time analysis status component
 * @module components/editor/RealtimeAnalysisStatus
 * @author WordWise.ai Team
 * @created 2024-01-XX
 * 
 * Dependencies:
 * - React for component structure
 * - Tailwind CSS for styling
 * 
 * Usage:
 * - Shows current analysis status to user
 * - Displays loading indicators and progress
 * - Shows error states and recovery options
 * 
 * ACCESSIBILITY: Includes ARIA labels and screen reader support
 * RESPONSIVE: Works across all device sizes
 */



/**
 * Analysis status types
 */
export type AnalysisStatus = 
  | 'idle'
  | 'pending'
  | 'analyzing'
  | 'complete'
  | 'error'
  | 'cancelled';

/**
 * Props for RealtimeAnalysisStatus component
 */
interface RealtimeAnalysisStatusProps {
  /** Current analysis status */
  status: AnalysisStatus;
  /** Number of suggestions found */
  suggestionsCount?: number;
  /** Processing time in milliseconds */
  processingTime?: number;
  /** Error message if status is error */
  error?: string;
  /** Whether the result came from cache */
  cacheHit?: boolean;
  /** Function to retry analysis */
  onRetry?: () => void;
  /** Function to cancel analysis */
  onCancel?: () => void;
}

/**
 * Real-time analysis status component
 * 
 * Shows the current state of real-time text analysis with appropriate
 * visual indicators and user feedback.
 * 
 * @param props - Component props
 * @returns JSX element showing analysis status
 */
export function RealtimeAnalysisStatus({
  status,
  suggestionsCount = 0,
  processingTime,
  error,
  cacheHit = false,
  onRetry,
  onCancel
}: RealtimeAnalysisStatusProps) {
  
  /**
   * Get status icon and color based on current state
   */
  const getStatusDisplay = () => {
    switch (status) {
      case 'idle':
        return {
          icon: '📝',
          text: 'Ready to analyze',
          color: 'text-gray-500',
          bgColor: 'bg-gray-100'
        };
      
      case 'pending':
        return {
          icon: '⏱️',
          text: 'Analysis starting...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        };
      
      case 'analyzing':
        return {
          icon: '🔄',
          text: 'Analyzing text...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      
      case 'complete':
        return {
          icon: '✅',
          text: `Found ${suggestionsCount} suggestion${suggestionsCount !== 1 ? 's' : ''}`,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      
      case 'error':
        return {
          icon: '❌',
          text: 'Analysis failed',
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      
      case 'cancelled':
        return {
          icon: '🚫',
          text: 'Analysis cancelled',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
      
      default:
        return {
          icon: '📝',
          text: 'Ready to analyze',
          color: 'text-gray-500',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className={`
      flex items-center justify-between px-3 py-2 rounded-lg border
      ${statusDisplay.bgColor} ${statusDisplay.color}
      transition-all duration-200 ease-in-out
    `}>
      {/* Status indicator */}
      <div className="flex items-center space-x-2">
        <span 
          className={`text-sm ${status === 'analyzing' ? 'animate-spin' : ''}`}
          role="img" 
          aria-label={`Analysis status: ${status}`}
        >
          {statusDisplay.icon}
        </span>
        
        <span className="text-sm font-medium">
          {statusDisplay.text}
        </span>
        
        {/* Cache indicator */}
        {status === 'complete' && cacheHit && (
          <span 
            className="text-xs px-2 py-1 bg-white rounded-full opacity-75"
            title="Result from cache"
          >
            💾 Cached
          </span>
        )}
      </div>

      {/* Processing time */}
      {status === 'complete' && processingTime && (
        <span className="text-xs opacity-75">
          {processingTime}ms
        </span>
      )}

      {/* Error message */}
      {status === 'error' && error && (
        <div className="flex items-center space-x-2">
          <span className="text-xs opacity-75 max-w-xs truncate">
            {error}
          </span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs px-2 py-1 bg-white rounded hover:bg-gray-50 transition-colors"
              aria-label="Retry analysis"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Cancel button for pending/analyzing states */}
      {(status === 'pending' || status === 'analyzing') && onCancel && (
        <button
          onClick={onCancel}
          className="text-xs px-2 py-1 bg-white rounded hover:bg-gray-50 transition-colors"
          aria-label="Cancel analysis"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

/**
 * Compact version of the analysis status
 */
export function CompactAnalysisStatus({ 
  status, 
  suggestionsCount = 0 
}: Pick<RealtimeAnalysisStatusProps, 'status' | 'suggestionsCount'>) {
  const getStatusIcon = () => {
    switch (status) {
      case 'analyzing': return '🔄';
      case 'complete': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏱️';
      default: return '📝';
    }
  };

  return (
    <div className="flex items-center space-x-1 text-xs text-gray-600">
      <span className={status === 'analyzing' ? 'animate-spin' : ''}>
        {getStatusIcon()}
      </span>
      {status === 'complete' && (
        <span>{suggestionsCount}</span>
      )}
    </div>
  );
} 
