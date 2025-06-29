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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentCard } from "@/components/dashboard/DocumentCard";
import { DocumentImport, DocumentCreationDialog } from "@/components/document";
import { useDocuments } from "@/hooks/document/useDocuments";
import { PageErrorBoundary } from "@/components/layout";
import { setActiveDocument } from "@/lib/utils";
import type { DocumentType } from "@/types/document";
import { 
  Plus, 
  FileText, 
  AlertCircle,
  Loader2,
  Search,
  Upload
} from "lucide-react";

/**
 * Document type display names
 */
const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  'general': 'General Writing',
  'essay': 'Essay',
  'creative-writing': 'Creative Writing',
  'script': 'Script',
  'email': 'Email',
  'academic': 'Academic Paper',
  'business': 'Business Document',
};

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
    deleteDocumentById,
    canCreateDocument
  } = useDocuments();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "all">("all");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [showImport, setShowImport] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  /**
   * Filter documents based on search query and document type
   */
  const filteredDocuments = useMemo(() => {
    const sortDocuments = (docs: typeof documents) => {
      return docs.sort((a, b) => {
        const aTime = a.updatedAt?.toMillis() || 0;
        const bTime = b.updatedAt?.toMillis() || 0;
        return bTime - aTime;
      });
    };

    let filtered = documents;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => doc.title.toLowerCase().includes(query));
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(doc => doc.type === typeFilter);
    }

    return sortDocuments(filtered);
  }, [documents, searchQuery, typeFilter]);

  /**
   * Handle opening the create document dialog
   */
  const handleCreateDocument = () => {
    setShowCreateDialog(true);
  };

  /**
   * Handle document creation from dialog
   */
  const handleDocumentCreated = (documentId: string) => {
    // Set as active document in session storage
    setActiveDocument(documentId);
    navigate(`/editor/${documentId}`);
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
        
        <div className="flex gap-2">
          <Button 
            onClick={handleCreateDocument}
            disabled={!canCreateDocument || saving}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowImport(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Document
          </Button>
        </div>
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

      {/* Search Bar and Filters */}
      {documents.length > 0 && (
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-48">
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as DocumentType | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Import component */}
      {showImport && (
        <DocumentImport
          onImportComplete={(documentId) => {
            setShowImport(false);
            setActiveDocument(documentId);
            navigate(`/editor/${documentId}`);
          }}
          onCancel={() => setShowImport(false)}
          className="mb-6"
        />
      )}

      {/* Document creation dialog */}
      <DocumentCreationDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onDocumentCreated={handleDocumentCreated}
      />

      {/* Documents grid */}
      <div className="pt-4">
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
              {searchQuery.trim() && typeFilter !== "all"
                ? `No documents match your search for "${searchQuery}" in ${DOCUMENT_TYPE_LABELS[typeFilter as DocumentType]} documents.`
                : searchQuery.trim()
                ? `No documents match your search for "${searchQuery}".`
                : typeFilter !== "all"
                ? `No ${DOCUMENT_TYPE_LABELS[typeFilter as DocumentType]} documents found.`
                : "No documents match your filters."
              }
            </CardDescription>
            <div className="flex gap-2">
              {searchQuery.trim() && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
              {typeFilter !== "all" && (
                <Button 
                  variant="outline" 
                  onClick={() => setTypeFilter("all")}
                >
                  Clear Type Filter
                </Button>
              )}
              {(searchQuery.trim() || typeFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setTypeFilter("all");
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
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
