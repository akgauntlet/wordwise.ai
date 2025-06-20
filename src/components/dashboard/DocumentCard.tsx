/**
 * @fileoverview Document card component
 * @module components/dashboard/DocumentCard
 * 
 * Dependencies: React, UI components, Document types
 * Usage: Display individual document information in a card format
 */

import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Hash, 
  Trash2, 
  Clock,
  History
} from "lucide-react";
import type { Document } from "@/types/document";

/**
 * Document card props
 */
interface DocumentCardProps {
  document: Document;
  onDelete: (documentId: string) => Promise<void>;
  onViewVersions?: (documentId: string) => void;
  isDeleting?: boolean;
  showVersionsButton?: boolean;
}

/**
 * Document card component for displaying document information
 */
export function DocumentCard({
  document,
  onDelete,
  onViewVersions,
  isDeleting = false,
  showVersionsButton = false
}: DocumentCardProps) {
  const navigate = useNavigate();

  /**
   * Handle opening the document in editor
   */
  const handleOpenDocument = () => {
    navigate(`/editor/${document.id}`);
  };

  /**
   * Handle delete confirmation
   */
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${document.title}"?`)) {
      await onDelete(document.id);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (timestamp: { toDate?: () => Date } | Date | string) => {
    let date: Date;
    
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
      date = timestamp.toDate?.() || new Date();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
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

  /**
   * Get document type display name
   */
  const getTypeDisplayName = (type: string) => {
    const typeMap: Record<string, string> = {
      "essay": "Essay",
      "creative-writing": "Creative Writing",
      "script": "Script",
      "general": "General",
      "email": "Email",
      "academic": "Academic",
      "business": "Business"
    };
    return typeMap[type] || type;
  };

  return (
    <Card className="hover:shadow-md hover:bg-accent/30 transition-all duration-300 ease-out cursor-pointer group">
      <CardHeader onClick={handleOpenDocument} className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {document.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {getTypeDisplayName(document.type)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {document.language.toUpperCase()}
              </span>
            </CardDescription>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {showVersionsButton && onViewVersions && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewVersions(document.id);
                }}
                title="View versions"
              >
                <History className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent onClick={handleOpenDocument}>
        {/* Document preview */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {document.plainText || "No content yet..."}
          </p>
        </div>
        
        {/* Document stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              <span>{document.wordCount} words</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{document.characterCount} characters</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Updated {formatDate(document.updatedAt)}</span>
          </div>
        </div>
        
        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {document.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {document.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{document.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
