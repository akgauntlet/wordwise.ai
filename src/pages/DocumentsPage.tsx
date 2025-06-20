/**
 * @fileoverview Documents page component
 * @module pages/DocumentsPage
 * 
 * Dependencies: React, UI components, Document hooks, Authentication
 * Usage: Dedicated page for viewing and managing all user documents
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DocumentCard } from "@/components/dashboard/DocumentCard";
import { useDocuments } from "@/hooks/document/useDocuments";
import { PageErrorBoundary } from "@/components/layout";
import { 
  Plus, 
  FileText, 
  AlertCircle,
  Loader2,
  Search
} from "lucide-react";

/**
 * Documents page content component
 */
function DocumentsPageContent() {
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

  const [searchQuery, setSearchQuery] = useState("");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  /**
   * Filter documents based on search query (title only)
   */
  const filteredDocuments = useMemo(() => {
    const sortDocuments = (docs: typeof documents) => {
      return docs.sort((a, b) => {
        const aTime = a.updatedAt?.toMillis() || 0;
        const bTime = b.updatedAt?.toMillis() || 0;
        return bTime - aTime;
      });
    };

    if (!searchQuery.trim()) {
      return sortDocuments(documents);
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = documents.filter(doc => doc.title.toLowerCase().includes(query));
    return sortDocuments(filtered);
  }, [documents, searchQuery]);

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
   * Handle viewing document versions (placeholder for now)
   */
  const handleViewVersions = (documentId: string) => {
    // TODO: Implement versions functionality
    console.log("View versions for document:", documentId);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold">My Documents</h2>
          <p className="text-muted-foreground mt-2">
            {documents.length === 0 
              ? "No documents yet" 
              : `${documents.length} document${documents.length === 1 ? '' : 's total'}`
            }
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

      {/* Search Bar */}
      {documents.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Documents grid */}
      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl mb-2">
              No documents yet
            </CardTitle>
            <CardDescription className="text-center mb-4">
              Create your first document to get started with writing and AI assistance.
            </CardDescription>
            {canCreateDocument && (
              <Button onClick={handleCreateDocument} disabled={saving}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Document
              </Button>
            )}
          </CardContent>
        </Card>
      ) : filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl mb-2">
              No documents found
            </CardTitle>
            <CardDescription className="text-center mb-4">
              No documents match your search for "{searchQuery}". Try a different search term.
            </CardDescription>
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onDelete={handleDeleteDocument}
              onViewVersions={handleViewVersions}
              isDeleting={deletingIds.has(document.id)}
              showVersionsButton={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Documents page with error boundary
 */
export function DocumentsPage() {
  return (
    <PageErrorBoundary pageName="Documents">
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <DocumentsPageContent />
        </div>
      </div>
    </PageErrorBoundary>
  );
} 
