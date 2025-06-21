/**
 * @fileoverview Document list component
 * @module components/dashboard/DocumentList
 * 
 * Dependencies: React, Document hooks, DocumentCard
 * Usage: Display and manage list of recent user documents (last 3)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DocumentCard } from "./DocumentCard";
import { useDocuments } from "@/hooks/document/useDocuments";
import { 
  Plus, 
  FileText, 
  AlertCircle,
  Loader2
} from "lucide-react";

/**
 * Document list component for managing recent user documents
 */
export function DocumentList() {
  const navigate = useNavigate();
  const {
    documents,
    loading,
    error,
    saving,
    saveError,
    createNewDocument,
    deleteDocumentById,
    canCreateDocument
  } = useDocuments();

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  /**
   * Get the 3 most recently updated documents
   */
  const recentDocuments = documents
    .sort((a, b) => {
      const aTime = a.updatedAt?.toMillis() || 0;
      const bTime = b.updatedAt?.toMillis() || 0;
      return bTime - aTime;
    })
    .slice(0, 3);

  /**
   * Handle creating a new document
   */
  const handleCreateDocument = async () => {
    const documentId = await createNewDocument();
    if (documentId) {
      navigate(`/editor/${documentId}`);
    }
  };

  /**
   * Handle deleting a document
   */
  const handleDeleteDocument = async (documentId: string) => {
    setDeletingIds(prev => new Set(prev).add(documentId));
    try {
      await deleteDocumentById(documentId);
    } catch (error) {
      console.error("Failed to delete document:", error);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading documents...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load documents: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Recent documents</h2>
      </div>

      {/* Error display */}
      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {saveError}
          </AlertDescription>
        </Alert>
      )}

      {/* Document limit warning */}
      {!canCreateDocument && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You've reached your document limit of 100 documents. Delete some documents to create new ones.
          </AlertDescription>
        </Alert>
      )}

      {/* Documents grid */}
      {recentDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl mb-2">
              No documents yet
            </CardTitle>
            <CardDescription className="text-center mb-4">
              Create your first document to get started with writing.
            </CardDescription>
            {canCreateDocument && (
              <Button onClick={handleCreateDocument} disabled={saving}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Document
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onDelete={handleDeleteDocument}
              isDeleting={deletingIds.has(document.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 
