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
import { 
  AlertCircle, 
  Clock, 
  FileText, 
  ExternalLink, 
  Loader2,
  ArrowLeft,
  Hash,
  Calendar
} from 'lucide-react';
import type { DocumentVersion } from '@/types/document';

/**
 * Version card component
 */
interface VersionCardProps {
  version: DocumentVersion;
  onSaveAsNew: (version: DocumentVersion) => void;
  isLoading?: boolean;
}

function VersionCard({ version, onSaveAsNew, isLoading = false }: VersionCardProps) {
  
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
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs">
                    {formatDate(version.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  <span className="text-xs">
                    {version.wordCount} words
                  </span>
                </div>
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => onSaveAsNew(version)}
              disabled={isLoading}
              title="Save as new document"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      

    </Card>
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
