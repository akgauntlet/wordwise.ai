/**
 * @fileoverview Editor page component
 * @module pages/EditorPage
 * 
 * Dependencies: React, DocumentEditor, Firebase
 * Usage: Main editor page route with document management
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { EnhancedDocumentEditor } from '@/components/editor';
import { useAuth } from '@/hooks/auth/useAuthContext';
import { useDocument } from '@/hooks/document';
import { PageErrorBoundary } from '@/components/layout';
import type { TiptapContent } from '@/types/document';



/**
 * Editor page component
 * Main page for document editing with toolbar, statistics, and auto-save
 */
function EditorPageContent() {
  const { documentId } = useParams<{ documentId: string }>();
  const { user } = useAuth();

  const { document, loading, error, saveStatus, updateContent, saveDocument } = useDocument(documentId || null);
  

  const [currentTitle, setCurrentTitle] = useState('');

  /**
   * Update title when document loads
   */
  useEffect(() => {
    if (document) {
      setCurrentTitle(document.title);
    }
  }, [document]);

  /**
   * Handle window beforeunload to warn about unsaved changes
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'pending') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  /**
   * Handle content changes in the editor
   */
  const handleContentChange = (content: TiptapContent) => {
    updateContent(content, currentTitle);
  };

  /**
   * Handle title changes in the editor
   */
  const handleTitleChange = async (newTitle: string) => {
    setCurrentTitle(newTitle);
    // Save the title change immediately
    if (document) {
      await saveDocument(document.content, newTitle);
    }
  };

  /**
   * Handle manual save from the editor
   */
  const handleManualSave = async (content: TiptapContent) => {
    await saveDocument(content, currentTitle);
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

  if (!documentId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No document specified. Please select a document from your dashboard or create a new one.
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
      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="h-[calc(100vh-8rem)]">
          {document ? (
            <EnhancedDocumentEditor
              initialContent={document.content}
              title={currentTitle}
              targetWords={500}
              showSuggestionSidebar={true}
              onContentChange={handleContentChange}
              onTitleChange={handleTitleChange}
              onAutoSave={handleManualSave} // Manual save handled by useDocument hook
              saveStatus={saveStatus}
              className="w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading document...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * Editor page with error boundary
 */
export function EditorPage() {
  return (
    <PageErrorBoundary pageName="Editor">
      <EditorPageContent />
    </PageErrorBoundary>
  );
} 
