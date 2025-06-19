/**
 * @fileoverview Editor statistics display component
 * @module components/editor/EditorStats
 * 
 * Dependencies: React, Tiptap editor, Shadcn UI, Lucide icons
 * Usage: Displays real-time statistics for the text editor
 */

import { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Type, 
  Clock, 
  Hash,
  Percent,
  Target,
  TrendingUp
} from 'lucide-react';
import { useEditorStats } from '@/hooks/editor';
import type { Editor } from '@tiptap/react';

/**
 * Editor statistics props
 */
interface EditorStatsProps {
  /** Tiptap editor instance */
  editor: Editor | null;
  /** Target word count for progress tracking */
  targetWords?: number;
  /** Whether to show detailed metrics */
  showDetails?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Individual stat item component
 */
const StatItem = memo(({ 
  icon: Icon, 
  label, 
  value, 
  color = 'text-foreground',
  description
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color?: string;
  description?: string;
}) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
    <div className={`p-2 rounded-md bg-background ${color}`}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="flex-1">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  </div>
));

StatItem.displayName = 'StatItem';

/**
 * Progress bar component
 */
const ProgressBar = memo(({ 
  current, 
  target, 
  label,
  color = 'bg-primary'
}: {
  current: number;
  target: number;
  label: string;
  color?: string;
}) => {
  const percentage = useMemo(() => Math.min((current / target) * 100, 100), [current, target]);
  const isComplete = useMemo(() => current >= target, [current, target]);
  
  const barStyle = useMemo(() => ({ width: `${percentage}%` }), [percentage]);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${isComplete ? 'text-green-600' : 'text-foreground'}`}>
          {current} / {target} ({Math.round(percentage)}%)
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : color
          }`}
          style={barStyle}
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

/**
 * Compact stats display for minimal space
 */
const CompactStats = memo(({ 
  stats, 
  className = '' 
}: { 
  stats: ReturnType<typeof useEditorStats>; 
  className?: string;
}) => (
  <div className={`flex items-center gap-4 text-sm text-muted-foreground ${className}`}>
    <div className="flex items-center gap-1">
      <Type className="h-3 w-3" />
      <span>{stats.words} words</span>
    </div>
    <div className="flex items-center gap-1">
      <Hash className="h-3 w-3" />
      <span>{stats.characters} characters</span>
    </div>
    <div className="flex items-center gap-1">
      <Clock className="h-3 w-3" />
      <span>{stats.readingTime} min read</span>
    </div>
  </div>
));

CompactStats.displayName = 'CompactStats';

/**
 * Detailed stats display with all metrics
 */
const DetailedStats = memo(({ 
  stats, 
  targetWords, 
  className = '' 
}: { 
  stats: ReturnType<typeof useEditorStats>; 
  targetWords?: number;
  className?: string;
}) => (
  <div className={`space-y-4 ${className}`}>
    {/* Primary metrics */}
    <div className="grid grid-cols-2 gap-4">
      <StatItem
        icon={Type}
        label="Words"
        value={stats.words}
        color="text-blue-600"
        description="Total word count"
      />
      <StatItem
        icon={Hash}
        label="Characters"
        value={stats.characters}
        color="text-green-600"
        description={`${stats.charactersNoSpaces} without spaces`}
      />
    </div>

    {/* Secondary metrics */}
    <div className="grid grid-cols-2 gap-4">
      <StatItem
        icon={FileText}
        label="Sentences"
        value={stats.sentences}
        color="text-purple-600"
        description={`${stats.avgWordsPerSentence} words/sentence`}
      />
      <StatItem
        icon={Clock}
        label="Reading Time"
        value={`${stats.readingTime} min`}
        color="text-orange-600"
        description="At 200 words/minute"
      />
    </div>

    {/* Advanced metrics */}
    <div className="grid grid-cols-2 gap-4">
      <StatItem
        icon={TrendingUp}
        label="Paragraphs"
        value={stats.paragraphs}
        color="text-indigo-600"
        description="Content blocks"
      />
      <StatItem
        icon={Percent}
        label="Avg Chars/Word"
        value={stats.avgCharactersPerWord}
        color="text-teal-600"
        description="Word complexity"
      />
    </div>

    {/* Progress tracking */}
    {targetWords && targetWords > 0 && (
      <div className="pt-4 border-t">
        <ProgressBar
          current={stats.words}
          target={targetWords}
          label="Writing Goal Progress"
          color="bg-blue-500"
        />
      </div>
    )}
  </div>
));

DetailedStats.displayName = 'DetailedStats';

/**
 * Editor statistics component
 * Displays comprehensive real-time statistics for the text editor
 * 
 * @param editor Tiptap editor instance
 * @param targetWords Target word count for progress tracking
 * @param showDetails Whether to show detailed metrics
 * @param className Additional CSS classes
 */
export const EditorStats = memo(function EditorStats({ 
  editor, 
  targetWords = 0, 
  showDetails = false, 
  className = '' 
}: EditorStatsProps) {
  const stats = useEditorStats(editor);

  if (!editor) {
    return null;
  }

  // Show compact stats by default
  if (!showDetails) {
    return <CompactStats stats={stats} className={className} />;
  }

  // Show detailed stats in a card
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Document Statistics
          </h3>
          <p className="text-sm text-muted-foreground">
            Real-time metrics for your writing
          </p>
        </div>
        
        <DetailedStats 
          stats={stats} 
          targetWords={targetWords}
        />
      </CardContent>
    </Card>
  );
}); 
