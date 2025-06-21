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
  Type, 
  Keyboard,
  Trash2, 
  Calendar
} from "lucide-react";
import { setActiveDocument, formatCount } from "@/lib/utils";
import { useActiveDocument } from "@/hooks/document";
import type { Document } from "@/types/document";

/**
 * Document card props
 */
interface DocumentCardProps {
  document: Document;
  onDelete: (documentId: string) => Promise<void>;
  isDeleting?: boolean;
}

/**
 * Document card component for displaying document information
 */
export function DocumentCard({
  document,
  onDelete,
  isDeleting = false
}: DocumentCardProps) {
  const navigate = useNavigate();
  const { isActiveDocument } = useActiveDocument();

  /**
   * Handle opening the document in editor
   */
  const handleOpenDocument = () => {
    // Set as active document in session storage
    setActiveDocument(document.id);
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

  // Check if this document is currently active
  const isCurrentlyActive = isActiveDocument(document.id);

  return (
    <Card className={`hover:shadow-md hover:bg-accent/30 transition-all duration-300 ease-out cursor-pointer group h-64 flex flex-col ${isCurrentlyActive ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader onClick={handleOpenDocument} className="pb-3 flex-shrink-0">
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
              {isCurrentlyActive && (
                <span className="text-xs text-primary font-medium">Current Document</span>
              )}
            </CardDescription>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
      
      <CardContent onClick={handleOpenDocument} className="flex flex-col flex-1 pt-0">
        {/* Document preview */}
        <div className="flex-1 mb-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {document.plainText || "No content yet..."}
          </p>
        </div>
        
        {/* Bottom section with stats and tags */}
        <div className="flex-shrink-0 space-y-3">
          {/* Tags */}
          {document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
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
          
          {/* Document stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Type className="h-3 w-3" />
                <span>{formatCount(document.wordCount, 'words')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Keyboard className="h-3 w-3" />
                <span>{formatCount(document.characterCount, 'characters')}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Updated {formatDate(document.updatedAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
