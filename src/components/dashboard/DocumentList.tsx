/**
 * @fileoverview Document list component
 * @module components/dashboard/DocumentList
 * 
 * Dependencies: React, Document hooks, DocumentCard
 * Usage: Display and manage list of user documents
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DocumentCard } from "./DocumentCard";
import { useDocuments } from "@/hooks/document/useDocuments";
import { 
  Plus, 
  Search, 
  FileText, 
  AlertCircle,
  Loader2
} from "lucide-react";

/**
 * Document list component for managing user documents
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
    updateDocumentById,
    deleteDocumentById,
    canCreateDocument
  } = useDocuments();

  const [searchQuery, setSearchQuery] = useState("");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [renamingIds, setRenamingIds] = useState<Set<string>>(new Set());

  /**
   * Filter documents based on search query
   */
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.plainText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  /**
   * Handle renaming a document
   */
  const handleRenameDocument = async (documentId: string, newTitle: string) => {
    setRenamingIds(prev => new Set(prev).add(documentId));
    try {
      await updateDocumentById(documentId, { title: newTitle });
    } catch (error) {
      console.error("Failed to rename document:", error);
    } finally {
      setRenamingIds(prev => {
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">My Documents</h2>
          <p className="text-muted-foreground">
            {documents.length} of {100} documents
          </p>
        </div>
        
        <Button 
          onClick={handleCreateDocument}
          disabled={!canCreateDocument || saving}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Document
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
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
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl mb-2">
              {searchQuery ? "No documents found" : "No documents yet"}
            </CardTitle>
            <CardDescription className="text-center mb-4">
              {searchQuery 
                ? `No documents match "${searchQuery}". Try a different search term.`
                : "Create your first document to get started with writing."
              }
            </CardDescription>
            {!searchQuery && canCreateDocument && (
              <Button onClick={handleCreateDocument} disabled={saving}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Document
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onDelete={handleDeleteDocument}
              onRename={handleRenameDocument}
              isDeleting={deletingIds.has(document.id)}
              isRenaming={renamingIds.has(document.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 
