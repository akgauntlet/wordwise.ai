/**
 * @fileoverview Document management hook
 * @module hooks/document/useDocuments
 * 
 * Dependencies: React, Document service, Authentication
 * Usage: State management and operations for user documents
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/auth/useAuthContext";
import {
  createDocument,
  updateDocument,
  deleteDocument,
  getUserDocuments,
  getDocument,
  subscribeToUserDocuments,
  DOCUMENT_LIMIT
} from "@/services/document/documentService";
import type { Document, DocumentFormData, TiptapContent } from "@/types/document";

/**
 * Document management state
 */
interface UseDocumentsState {
  documents: Document[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
}

/**
 * Document management hook return type
 */
interface UseDocumentsReturn extends UseDocumentsState {
  createNewDocument: (formData?: Partial<DocumentFormData>) => Promise<string | null>;
  updateDocumentById: (documentId: string, updates: Partial<Document>) => Promise<void>;
  deleteDocumentById: (documentId: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
  canCreateDocument: boolean;
}

/**
 * Hook for managing user documents
 */
export function useDocuments(): UseDocumentsReturn {
  const { user } = useAuth();
  const [state, setState] = useState<UseDocumentsState>({
    documents: [],
    loading: true,
    error: null,
    saving: false,
    saveError: null
  });

  /**
   * Set loading state
   */
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  /**
   * Set error state
   */
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  /**
   * Set saving state
   */
  const setSaving = useCallback((saving: boolean) => {
    setState(prev => ({ ...prev, saving }));
  }, []);

  /**
   * Set save error state
   */
  const setSaveError = useCallback((saveError: string | null) => {
    setState(prev => ({ ...prev, saveError }));
  }, []);

  /**
   * Set documents
   */
  const setDocuments = useCallback((documents: Document[]) => {
    setState(prev => ({ ...prev, documents }));
  }, []);

  /**
   * Load user documents
   */
  const loadDocuments = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const docs = await getUserDocuments(user.uid);
      setDocuments(docs);
    } catch (err) {
      console.error("Error loading documents:", err);
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [user?.uid, setLoading, setError, setDocuments]);

  /**
   * Subscribe to real-time document updates
   */
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToUserDocuments(user.uid, (documents) => {
      setDocuments(documents);
      setLoading(false);
    });

    return unsubscribe;
  }, [user?.uid, setDocuments, setLoading]);

  /**
   * Create a new document
   */
  const createNewDocument = useCallback(async (
    formData: Partial<DocumentFormData> = {}
  ): Promise<string | null> => {
    if (!user?.uid) {
      setError("User not authenticated");
      return null;
    }

    try {
      setSaving(true);
      setSaveError(null);
      
      const documentId = await createDocument(user.uid, formData);
      return documentId;
    } catch (err) {
      console.error("Error creating document:", err);
      setSaveError(err instanceof Error ? err.message : "Failed to create document");
      return null;
    } finally {
      setSaving(false);
    }
  }, [user?.uid, setSaving, setSaveError, setError]);

  /**
   * Update a document
   */
  const updateDocumentById = useCallback(async (
    documentId: string,
    updates: Partial<Document>
  ): Promise<void> => {
    try {
      setSaving(true);
      setSaveError(null);
      
      await updateDocument(documentId, updates);
    } catch (err) {
      console.error("Error updating document:", err);
      setSaveError(err instanceof Error ? err.message : "Failed to update document");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [setSaving, setSaveError]);

  /**
   * Delete a document
   */
  const deleteDocumentById = useCallback(async (documentId: string): Promise<void> => {
    try {
      setSaving(true);
      setSaveError(null);
      
      await deleteDocument(documentId);
    } catch (err) {
      console.error("Error deleting document:", err);
      setSaveError(err instanceof Error ? err.message : "Failed to delete document");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [setSaving, setSaveError]);

  /**
   * Refresh documents manually
   */
  const refreshDocuments = useCallback(async (): Promise<void> => {
    await loadDocuments();
  }, [loadDocuments]);

  /**
   * Check if user can create more documents
   */
  const canCreateDocument = state.documents.length < DOCUMENT_LIMIT;

  return {
    ...state,
    createNewDocument,
    updateDocumentById,
    deleteDocumentById,
    refreshDocuments,
    canCreateDocument
  };
}

/**
 * Hook for managing a single document with auto-save
 */
export function useDocument(documentId: string | null) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'auto-saved' | 'saving' | 'pending' | 'error'>('saved');
  const isInitialLoad = useRef(true);

  /**
   * Load document
   */
  const loadDocument = useCallback(async () => {
    if (!documentId) return;

    try {
      setLoading(true);
      setError(null);
      const doc = await getDocument(documentId);
      setDocument(doc);
    } catch (err) {
      console.error("Error loading document:", err);
      setError(err instanceof Error ? err.message : "Failed to load document");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  /**
   * Auto-save content with debouncing (saves after user stops typing)
   */
  const scheduleAutoSave = useCallback((content: TiptapContent, title?: string) => {
    // Clear the previous timer (debouncing)
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    // Set status to pending (user has unsaved changes)
    setSaveStatus('pending');

    // Set a new timer - only saves if user stops typing for 2 minutes
    const timer = setTimeout(async () => {
      if (!documentId) return;
      
      try {
        setSaveStatus('saving');
        
        const updates: Partial<Document> = { content };
        if (title) updates.title = title;
        
        await updateDocument(documentId, updates);
        setSaveStatus('auto-saved');
      } catch (err) {
        setSaveStatus('error');
        console.error("Auto-save failed:", err);
      }
    }, 2 * 60 * 1000); // 2 minutes after user stops typing

    autoSaveTimer.current = timer;
  }, [documentId]);

  /**
   * Save document immediately
   */
  const saveDocument = useCallback(async (content?: TiptapContent, title?: string) => {
    if (!documentId || !document) return;
    
    try {
      const updates: Partial<Document> = {};
      if (content) updates.content = content;
      if (title) updates.title = title;
      
      if (Object.keys(updates).length > 0) {
        setSaveStatus('saving');
        await updateDocument(documentId, updates);
        setSaveStatus('saved');
      }
    } catch (err) {
      setSaveStatus('error');
              console.error("Immediate save failed:", err);
    }
  }, [documentId, document]);

  /**
   * Update document content
   */
  const updateContent = useCallback((content: TiptapContent, title?: string) => {
    if (document) {
      const updatedDoc = { ...document, content };
      if (title) updatedDoc.title = title;
      setDocument(updatedDoc);
      
      // Schedule auto-save
      scheduleAutoSave(content, title);
    }
  }, [document, scheduleAutoSave]);

  /**
   * Load document on mount or ID change
   */
  useEffect(() => {
    isInitialLoad.current = true; // Reset flag when document ID changes
    loadDocument();
  }, [loadDocument]);

  /**
   * Set save status to 'saved' when document initially loads (not on content updates)
   */
  useEffect(() => {
    if (document && isInitialLoad.current) {
      setSaveStatus('saved');
      isInitialLoad.current = false;
    }
  }, [document]);

  /**
   * Clean up auto-save timer
   */
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

  return {
    document,
    loading,
    error,
    saveStatus,
    updateContent,
    saveDocument,
    loadDocument
  };
} 
