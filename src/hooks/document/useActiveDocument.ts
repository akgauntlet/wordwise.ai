/**
 * @fileoverview Hook for managing active document state
 * @module hooks/document/useActiveDocument
 * 
 * Dependencies: React, Session storage utilities
 * Usage: Provides reactive access to active document state stored in session storage
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getActiveDocument, 
  setActiveDocument as setActiveDocumentInStorage, 
  clearActiveDocument as clearActiveDocumentFromStorage,
  isActiveDocument 
} from '@/lib/utils';

/**
 * Custom hook for managing active document state
 * Provides reactive access to the active document ID stored in session storage
 * 
 * @returns Object containing active document state and control functions
 */
export function useActiveDocument() {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(() => {
    // Initialize with current value from session storage
    return getActiveDocument();
  });

  /**
   * Set the active document and update both state and session storage
   * @param documentId Document ID to set as active
   */
  const setActiveDocument = useCallback((documentId: string) => {
    setActiveDocumentInStorage(documentId);
    setActiveDocumentId(documentId);
  }, []);

  /**
   * Clear the active document from both state and session storage
   */
  const clearActiveDocument = useCallback(() => {
    clearActiveDocumentFromStorage();
    setActiveDocumentId(null);
  }, []);

  /**
   * Check if a specific document is currently active
   * @param documentId Document ID to check
   * @returns True if the document is currently active
   */
  const checkIsActiveDocument = useCallback((documentId: string) => {
    return isActiveDocument(documentId);
  }, []);

  /**
   * Listen for storage events to sync state across tabs/windows
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wordwise_active_document_id') {
        setActiveDocumentId(e.newValue);
      }
    };

    // Listen for storage events (fired when other tabs change session storage)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events within the same tab
    const handleCustomStorageChange = () => {
      setActiveDocumentId(getActiveDocument());
    };
    
    window.addEventListener('active-document-changed', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('active-document-changed', handleCustomStorageChange);
    };
  }, []);

  return {
    /** Current active document ID */
    activeDocumentId,
    /** Set a document as active */
    setActiveDocument,
    /** Clear the active document */
    clearActiveDocument,
    /** Check if a document is currently active */
    isActiveDocument: checkIsActiveDocument,
    /** Whether there is an active document */
    hasActiveDocument: activeDocumentId !== null,
  };
} 
