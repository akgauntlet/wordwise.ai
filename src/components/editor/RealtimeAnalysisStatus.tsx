/**
 * @fileoverview Real-time analysis status component
 * @module components/editor/RealtimeAnalysisStatus
 * @author WordWise.ai Team
 * @created 2024-01-XX
 * 
 * Dependencies:
 * - React for component structure
 * - Tailwind CSS for styling
 * - Lucide React for icons
 * 
 * Usage:
 * - Shows current analysis status to user
 * - Displays loading indicators and progress
 * - Shows error states and recovery options
 * 
 * ACCESSIBILITY: Includes ARIA labels and screen reader support
 * RESPONSIVE: Works across all device sizes
 */

import { 
  PenTool, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  StopCircle,
  Database,
  RotateCcw
} from 'lucide-react';



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
          icon: <PenTool className="h-4 w-4" />,
          text: 'Ready to analyze',
          color: 'text-slate-500',
          bgColor: 'bg-gradient-to-r from-slate-50 to-slate-100',
          borderColor: 'border-slate-200'
        };
      
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4 animate-pulse" />,
          text: 'Analysis starting...',
          color: 'text-amber-600',
          bgColor: 'bg-gradient-to-r from-amber-50 to-yellow-50',
          borderColor: 'border-amber-200'
        };
      
      case 'analyzing':
        return {
          icon: <Sparkles className="h-4 w-4 animate-pulse" />,
          text: 'Analyzing text...',
          color: 'text-blue-600',
          bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          borderColor: 'border-blue-200'
        };
      
      case 'complete':
        return {
          icon: <CheckCircle2 className="h-4 w-4 animate-pulse" />,
          text: `Found ${suggestionsCount} suggestion${suggestionsCount !== 1 ? 's' : ''}`,
          color: 'text-emerald-600',
          bgColor: 'bg-gradient-to-r from-emerald-50 to-green-50',
          borderColor: 'border-emerald-200'
        };
      
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4 animate-pulse" />,
          text: 'Analysis failed',
          color: 'text-rose-600',
          bgColor: 'bg-gradient-to-r from-rose-50 to-red-50',
          borderColor: 'border-rose-200'
        };
      
      case 'cancelled':
        return {
          icon: <StopCircle className="h-4 w-4" />,
          text: 'Analysis cancelled',
          color: 'text-gray-500',
          bgColor: 'bg-gradient-to-r from-gray-50 to-slate-50',
          borderColor: 'border-gray-200'
        };
      
      default:
        return {
          icon: <PenTool className="h-4 w-4" />,
          text: 'Ready to analyze',
          color: 'text-slate-500',
          bgColor: 'bg-gradient-to-r from-slate-50 to-slate-100',
          borderColor: 'border-slate-200'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className={`
      flex items-center justify-between px-4 py-3 rounded-xl border shadow-sm
      ${statusDisplay.bgColor} ${statusDisplay.color} ${statusDisplay.borderColor}
      transition-all duration-300 ease-in-out
    `}>
      {/* Status indicator */}
      <div className="flex items-center space-x-2">
        <div 
          className={`${statusDisplay.color}`}
          role="img" 
          aria-label={`Analysis status: ${status}`}
        >
          {statusDisplay.icon}
        </div>
        
        <span className="text-sm font-medium">
          {statusDisplay.text}
        </span>
        
        {/* Cache indicator */}
        {status === 'complete' && cacheHit && (
          <span 
            className="text-xs px-2 py-1 bg-white/80 rounded-full opacity-90 flex items-center gap-1 border border-white/50 shadow-sm backdrop-blur-sm"
            title="Result from cache"
          >
            <Database className="h-3 w-3 text-blue-500" />
            <span className="text-slate-600">Cached</span>
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
              className="text-xs px-3 py-1.5 bg-white rounded-lg transition-all duration-200 flex items-center gap-1.5 shadow-sm border border-gray-200"
              aria-label="Retry analysis"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      )}

      {/* Cancel button for pending/analyzing states */}
      {(status === 'pending' || status === 'analyzing') && onCancel && (
        <button
          onClick={onCancel}
          className="text-xs px-3 py-1.5 bg-white rounded-lg transition-all duration-200 flex items-center gap-1.5 shadow-sm border border-gray-200"
          aria-label="Cancel analysis"
        >
          <StopCircle className="h-3 w-3" />
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
      case 'analyzing': return <Sparkles className="h-3 w-3 animate-pulse" />;
      case 'complete': return <CheckCircle2 className="h-3 w-3" />;
      case 'error': return <AlertCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3 animate-pulse" />;
      default: return <PenTool className="h-3 w-3" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'analyzing': return 'text-blue-600';
      case 'complete': return 'text-emerald-600';
      case 'error': return 'text-rose-600';
      case 'pending': return 'text-amber-600';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="flex items-center space-x-1 text-xs">
      <div className={getStatusColor()}>
        {getStatusIcon()}
      </div>
      {status === 'complete' && (
        <span className="text-gray-600">{suggestionsCount}</span>
      )}
    </div>
  );
} 
