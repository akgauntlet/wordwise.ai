/**
 * @fileoverview Versions history page component
 * @module pages/VersionsPage
 * 
 * Dependencies: React, Document hooks, UI components, Router
 * Usage: Display and manage document version history
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageErrorBoundary } from '@/components/layout';
import { useActiveDocument, useDocumentVersions, useDocument } from '@/hooks/document';
import { setActiveDocument } from '@/lib/utils';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  AlertCircle, 
  Clock, 
  FileText,
  ExternalLink, 
  Loader2,
  ArrowLeft,
  Hash,
  Calendar,
  Eye
} from 'lucide-react';
import type { DocumentVersion } from '@/types/document';

/**
 * Version card component
 */
interface VersionCardProps {
  version: DocumentVersion;
  onSaveAsNew: (version: DocumentVersion) => void;
  onPreview: (version: DocumentVersion) => void;
  isLoading?: boolean;
}

function VersionCard({ version, onSaveAsNew, onPreview, isLoading = false }: VersionCardProps) {
  
  /**
   * Format date for display
   */
  const formatDate = (timestamp: { toDate?: () => Date } | Date | string) => {
    let date: Date;
    
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
      date = timestamp.toDate?.() || new Date();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date();
    }
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-base">
                Version {version.version}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs">
                    {formatDate(version.createdAt)}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  <span className="text-xs">
                    {version.wordCount} words
                  </span>
                </span>
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPreview(version)}
              disabled={isLoading}
              title="Quick preview"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => onSaveAsNew(version)}
              disabled={isLoading}
              title="Save as new document"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Save as New Document
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      

    </Card>
  );
}

/**
 * Quick preview modal component
 */
interface QuickPreviewModalProps {
  version: DocumentVersion | null;
  isOpen: boolean;
  onClose: () => void;
}

function QuickPreviewModal({ version, isOpen, onClose }: QuickPreviewModalProps) {
  /**
   * Create read-only editor instance for preview
   */
  const editor = useEditor({
    extensions: [StarterKit],
    content: version?.content || null,
    editable: false,
    immediatelyRender: false,
  }, [version?.content]);

  /**
   * Format date for display
   */
  const formatDate = (timestamp: { toDate?: () => Date } | Date | string) => {
    let date: Date;
    
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
      date = timestamp.toDate?.() || new Date();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date();
    }
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Update editor content when version changes
  useEffect(() => {
    if (editor && version) {
      editor.commands.setContent(version.content);
    }
  }, [editor, version]);

  // Cleanup editor when modal closes
  useEffect(() => {
    return () => {
      if (editor && !isOpen) {
        editor.destroy();
      }
    };
  }, [editor, isOpen]);

  if (!isOpen || !version) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Version {version.version} Preview
              </CardTitle>
              <CardDescription className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs">
                    {formatDate(version.createdAt)}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  <span className="text-xs">
                    {version.wordCount} words
                  </span>
                </span>
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <div className="max-h-[50vh] overflow-auto border rounded-lg bg-background">
            {editor ? (
              <div className="p-6">
                <EditorContent 
                  editor={editor} 
                  className="prose prose-slate max-w-none focus:outline-none
                    prose-headings:text-foreground 
                    prose-p:text-foreground 
                    prose-strong:text-foreground 
                    prose-em:text-foreground
                    prose-ul:text-foreground 
                    prose-ol:text-foreground 
                    prose-li:text-foreground
                    prose-blockquote:text-muted-foreground 
                    prose-blockquote:border-l-border
                    prose-code:text-foreground 
                    prose-code:bg-muted 
                    prose-pre:text-foreground 
                    prose-pre:bg-muted"
                />
              </div>
            ) : (
              <div className="p-6 text-muted-foreground">Loading content...</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Save version dialog component
 */
interface SaveVersionDialogProps {
  version: DocumentVersion | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (versionId: string, title: string) => Promise<void>;
  isLoading: boolean;
}

function SaveVersionDialog({ version, isOpen, onClose, onSave, isLoading }: SaveVersionDialogProps) {
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (version && isOpen) {
      setNewTitle(`Document (Version ${version.version})`);
    }
  }, [version, isOpen]);

  const handleSave = async () => {
    if (version && newTitle.trim()) {
      await onSave(version.id, newTitle.trim());
    }
  };

  if (!isOpen || !version) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Save Version as New Document</CardTitle>
          <CardDescription>
            Save Version {version.version} as a new document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter document title..."
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !newTitle.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Document...
                </>
              ) : (
                'Save as New Document'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Versions page content component
 */
function VersionsPageContent() {
  const navigate = useNavigate();
  const { activeDocumentId, hasActiveDocument } = useActiveDocument();
  const { document } = useDocument(activeDocumentId);
  const { 
    versions, 
    loading, 
    error, 
    saving, 
    saveError, 
    loadVersions, 
    saveVersionAsNewDocument 
  } = useDocumentVersions();

  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<DocumentVersion | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  /**
   * Load versions when active document changes
   */
  useEffect(() => {
    if (activeDocumentId) {
      loadVersions(activeDocumentId);
    }
  }, [activeDocumentId, loadVersions]);



  /**
   * Handle saving version as new document
   */
  const handleSaveAsNew = (version: DocumentVersion) => {
    setSelectedVersion(version);
    setShowSaveDialog(true);
  };

  /**
   * Handle preview version in modal
   */
  const handlePreview = (version: DocumentVersion) => {
    setPreviewVersion(version);
    setShowPreviewModal(true);
  };

  /**
   * Handle close preview modal
   */
  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setPreviewVersion(null);
  };

  /**
   * Handle save confirmation
   */
  const handleSaveConfirm = async (versionId: string, title: string) => {
    const documentId = await saveVersionAsNewDocument(versionId, title);
    if (documentId) {
      setShowSaveDialog(false);
      setSelectedVersion(null);
      
      // Navigate to the new document
      setActiveDocument(documentId);
      navigate(`/editor/${documentId}`);
    }
  };

  /**
   * Handle close save dialog
   */
  const handleCloseSaveDialog = () => {
    if (!saving) {
      setShowSaveDialog(false);
      setSelectedVersion(null);
    }
  };

  if (!hasActiveDocument) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="text-xl mb-2">
                No Active Document
              </CardTitle>
              <CardDescription className="text-center mb-4">
                You need to have an active document to view version history. 
                Please open a document from your dashboard first.
              </CardDescription>
              <Button onClick={() => navigate('/documents')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Documents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold">Version History</h2>
            <p className="text-muted-foreground mt-2">
              {document ? `Versions for "${document.title}"` : 'Document version history'}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/documents')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Save Error Alert */}
        {saveError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading version history...</span>
          </div>
        )}

        {/* Versions List */}
        {!loading && versions.length === 0 && !error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="text-xl mb-2">
                No Version History Yet
              </CardTitle>
              <CardDescription className="text-center">
                This document doesn't have any saved versions yet. 
                Versions are automatically created when you save your document.
              </CardDescription>
            </CardContent>
          </Card>
        )}

        {!loading && versions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {versions.length} version{versions.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid gap-4">
              {versions.map((version: DocumentVersion) => (
                <VersionCard
                  key={version.id}
                  version={version}
                  onSaveAsNew={handleSaveAsNew}
                  onPreview={handlePreview}
                  isLoading={saving}
                />
              ))}
            </div>
          </div>
        )}

        {/* Save Version Dialog */}
        <SaveVersionDialog
          version={selectedVersion}
          isOpen={showSaveDialog}
          onClose={handleCloseSaveDialog}
          onSave={handleSaveConfirm}
          isLoading={saving}
        />

        {/* Quick Preview Modal */}
        <QuickPreviewModal
          version={previewVersion}
          isOpen={showPreviewModal}
          onClose={handleClosePreview}
        />
      </div>
    </div>
  );
}

/**
 * Versions page with error boundary
 */
export function VersionsPage() {
  return (
    <PageErrorBoundary>
      <VersionsPageContent />
    </PageErrorBoundary>
  );
} 
