/**
 * @fileoverview Hook for managing document versions
 * @module hooks/document/useDocumentVersions
 * 
 * Dependencies: React, Document service, Document types, Authentication
 * Usage: Provides version history management functionality
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import {
  getDocumentVersions,
  getDocumentVersion,
  createDocument,
  getDocument
} from '@/services/document/documentService';
import type { DocumentVersion } from '@/types/document';

/**
 * Document versions state
 */
interface UseDocumentVersionsState {
  versions: DocumentVersion[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
}

/**
 * Return type for useDocumentVersions hook
 */
interface UseDocumentVersionsReturn extends UseDocumentVersionsState {
  loadVersions: (documentId: string) => Promise<void>;
  saveVersionAsNewDocument: (versionId: string, newTitle?: string) => Promise<string | null>;
  refreshVersions: () => Promise<void>;
}

/**
 * Hook for managing document versions
 * Provides version history loading, saving versions as new documents
 * 
 * @returns Object containing version state and management functions
 */
export function useDocumentVersions(): UseDocumentVersionsReturn {
  const { user } = useAuth();
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  
  const [state, setState] = useState<UseDocumentVersionsState>({
    versions: [],
    loading: false,
    error: null,
    saving: false,
    saveError: null
  });

  /**
   * Update state helper
   */
  const updateState = useCallback((updates: Partial<UseDocumentVersionsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Load versions for a document
   */
  const loadVersions = useCallback(async (documentId: string) => {
    if (!user?.uid) {
      updateState({ error: "User not authenticated" });
      return;
    }

    try {
      updateState({ loading: true, error: null });
      setCurrentDocumentId(documentId);
      
      const versions = await getDocumentVersions(documentId);
      updateState({ versions, loading: false });
    } catch (err) {
      console.error("Error loading document versions:", err);
      updateState({ 
        error: err instanceof Error ? err.message : "Failed to load versions",
        loading: false 
      });
    }
  }, [user?.uid, updateState]);

  /**
   * Save a version as a new document
   */
  const saveVersionAsNewDocument = useCallback(async (
    versionId: string, 
    newTitle?: string
  ): Promise<string | null> => {
    if (!user?.uid) {
      updateState({ saveError: "User not authenticated" });
      return null;
    }

    try {
      updateState({ saving: true, saveError: null });
      
      // Get the version data
      const version = await getDocumentVersion(versionId);
      if (!version) {
        throw new Error("Version not found");
      }

      // Get the original document to copy metadata
      const originalDocument = await getDocument(version.documentId);
      if (!originalDocument) {
        throw new Error("Original document not found");
      }

      // Create new document from version content
      const documentId = await createDocument(user.uid, {
        title: newTitle || `${originalDocument.title} (Version ${version.version})`,
        content: version.content,
        tags: originalDocument.tags,
        type: originalDocument.type,
        language: originalDocument.language
      });

      updateState({ saving: false });
      return documentId;
    } catch (err) {
      console.error("Error saving version as new document:", err);
      updateState({ 
        saveError: err instanceof Error ? err.message : "Failed to save version as new document",
        saving: false 
      });
      return null;
    }
  }, [user?.uid, updateState]);

  /**
   * Refresh versions for current document
   */
  const refreshVersions = useCallback(async () => {
    if (currentDocumentId) {
      await loadVersions(currentDocumentId);
    }
  }, [currentDocumentId, loadVersions]);

  return {
    ...state,
    loadVersions,
    saveVersionAsNewDocument,
    refreshVersions
  };
} 
