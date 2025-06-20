/**
 * @fileoverview Demo component showcasing the suggestion system
 * @module components/editor/SuggestionDemo
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SuggestionSidebar } from './SuggestionSidebar';
import { SuggestionPopover } from './SuggestionPopover';
import type { WritingSuggestion } from './SuggestionExtension';

// Mock suggestions for demonstration
const mockSuggestions: WritingSuggestion[] = [
  {
    id: 'grammar_1',
    type: 'grammar',
    severity: 'high',
    startOffset: 10,
    endOffset: 25,
    originalText: 'students goes',
    suggestedText: 'students go',
    explanation: 'Subject-verb agreement error: plural subject requires plural verb',
    category: 'subject-verb agreement',
    confidence: 0.95,
    grammarRule: 'Subject-Verb Agreement',
    eslExplanation: 'When the subject is plural, the verb must also be plural.'
  },
  {
    id: 'style_1', 
    type: 'style',
    severity: 'medium',
    startOffset: 30,
    endOffset: 45,
    originalText: 'I think that maybe',
    suggestedText: 'The evidence suggests',
    explanation: 'Replace uncertain language with confident academic phrasing',
    category: 'academic tone',
    confidence: 0.88,
    styleCategory: 'formality',
    impact: 'high'
  },
  {
    id: 'readability_1',
    type: 'readability', 
    severity: 'low',
    startOffset: 50,
    endOffset: 80,
    originalText: 'multifaceted interdisciplinary approach',
    suggestedText: 'multiple methods from different fields',
    explanation: 'Simplify complex academic jargon for better clarity',
    category: 'word complexity',
    confidence: 0.92,
    metric: 'word-complexity',
    targetLevel: 'Grade 14'
  }
];

export function SuggestionDemo() {
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>(mockSuggestions);
  const [selectedSuggestion, setSelectedSuggestion] = useState<WritingSuggestion | null>(null);
  const [popoverPosition] = useState({ x: 400, y: 300 });

  const handleSuggestionClick = (suggestion: WritingSuggestion) => {
    setSelectedSuggestion(suggestion);
  };

  const handleAccept = (suggestion: WritingSuggestion) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    setSelectedSuggestion(null);
  };

  const handleReject = (suggestion: WritingSuggestion) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    setSelectedSuggestion(null);
  };

  const handleAcceptAllType = (type: WritingSuggestion['type']) => {
    setSuggestions(prev => prev.filter(s => s.type !== type));
  };

  const handleRejectAllType = (type: WritingSuggestion['type']) => {
    setSuggestions(prev => prev.filter(s => s.type !== type));
  };

  const handleShowPopover = () => {
    setSelectedSuggestion(suggestions[0] || null);
  };

  return (
    <div className="h-screen flex">
      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Suggestion System Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This demo shows the implemented suggestion system components:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>✅ SuggestionExtension (Tiptap extension with decorations)</li>
              <li>✅ SuggestionSidebar (categorized suggestions with bulk actions)</li>
              <li>✅ SuggestionPopover (click-based detailed view)</li>
              <li>✅ Real-time analysis hook integration</li>
              <li>✅ Color-coded suggestion types</li>
              <li>✅ Accept/reject individual and bulk actions</li>
            </ul>
            
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Mock Content with Suggestions:</h3>
              <div className="bg-muted p-4 rounded text-sm">
                The quick <span className="border-b-2 border-wavy border-error-600 bg-error-50/30 cursor-pointer">students goes</span> to 
                <span className="border-b-2 border-wavy border-warning-600 bg-warning-50/30 cursor-pointer ml-1">I think that maybe</span> the 
                <span className="border-b-2 border-wavy border-success-600 bg-success-50/30 cursor-pointer ml-1">multifaceted interdisciplinary approach</span> is best.
              </div>
              <Button onClick={handleShowPopover} className="mt-2" size="sm">
                Show Sample Popover
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <SuggestionSidebar
        suggestions={suggestions}
        isAnalyzing={false}
        onSuggestionClick={handleSuggestionClick}
        onAcceptSuggestion={handleAccept}
        onRejectSuggestion={handleReject}
        onAcceptAllType={handleAcceptAllType}
        onRejectAllType={handleRejectAllType}
      />

      <SuggestionPopover
        suggestion={selectedSuggestion}
        isVisible={!!selectedSuggestion}
        position={popoverPosition}
        onAccept={handleAccept}
        onReject={handleReject}
        onClose={() => setSelectedSuggestion(null)}
      />
    </div>
  );
} 
