/**
 * @fileoverview Editor page component
 * @module pages/EditorPage
 * 
 * Dependencies: React, DocumentEditor, Firebase
 * Usage: Main editor page route with document management
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Settings, AlertCircle, Check, Clock, AlertTriangle } from 'lucide-react';
import { DocumentEditor } from '@/components/editor';
import { useAuth } from '@/hooks/auth/useAuthContext';
import { useDocument, useDocuments } from '@/hooks/document';
import type { TiptapContent } from '@/types/document';



/**
 * Editor page component
 * Main page for document editing with toolbar, statistics, and auto-save
 */
export function EditorPage() {
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const { user } = useAuth();
  const { createNewDocument } = useDocuments();
  const { document, loading, error, saveStatus, updateContent, saveDocument } = useDocument(documentId || null);
  
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('');

  /**
   * Handle new documents or update title when document loads
   */
  useEffect(() => {
    if (document) {
      setCurrentTitle(document.title);
    } else if (!documentId) {
      // Create a new document when no ID is provided
      handleCreateNewDocument();
    }
  }, [document, documentId]);

  /**
   * Create a new document and redirect to its editor
   */
  const handleCreateNewDocument = async () => {
    const newDocumentId = await createNewDocument();
    if (newDocumentId) {
      navigate(`/editor/${newDocumentId}`, { replace: true });
    }
  };

  /**
   * Handle content changes in the editor
   */
  const handleContentChange = (content: TiptapContent) => {
    updateContent(content, currentTitle);
  };

  /**
   * Handle manual save from the editor
   */
  const handleManualSave = async (content: TiptapContent, ..._args: unknown[]) => {
    await saveDocument(content, currentTitle);
  };



  /**
   * Navigate back to dashboard
   */
  const handleBackToDashboard = () => {
    navigate('/');
  };

  /**
   * Toggle detailed statistics view
   */
  const toggleDetailedStats = () => {
    setShowDetailedStats(!showDetailedStats);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to be logged in to access the editor.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
              
              <div className="text-sm text-muted-foreground">
                WordWise.ai Editor
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Save Status Indicator */}
              <div className="flex items-center gap-2 text-sm">
                {saveStatus === 'saved' && (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Saved</span>
                  </>
                )}
                {saveStatus === 'saving' && (
                  <>
                    <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                    <span className="text-blue-600">Saving...</span>
                  </>
                )}
                {saveStatus === 'pending' && (
                  <>
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-600">Unsaved changes</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">Save failed</span>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleDetailedStats}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {showDetailedStats ? 'Hide' : 'Show'} Stats
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Editor */}
          <div className={`${showDetailedStats ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {document ? (
              <DocumentEditor
                initialContent={document.content}
                title={currentTitle}
                targetWords={500}
                onContentChange={handleContentChange}
                onAutoSave={handleManualSave} // Manual save handled by useDocument hook
                autoSaveInterval={30000} // 30 seconds
                className="w-full"
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading document...</p>
              </div>
            )}
          </div>

          {/* Detailed statistics sidebar */}
          {showDetailedStats && (
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* This will be populated by the DocumentEditor's detailed stats */}
                <div className="text-center text-muted-foreground p-4">
                  <p className="text-sm">Detailed statistics are shown above the editor when available.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 
