/**
 * @fileoverview Session storage utilities
 * @module lib/utils/sessionStorage
 * 
 * Dependencies: None
 * Usage: Manage session storage for active document and other session state
 */

/**
 * Session storage keys
 */
const SESSION_KEYS = {
  ACTIVE_DOCUMENT_ID: 'wordwise_active_document_id',
} as const;

/**
 * Set the active document ID in session storage
 * @param documentId Document ID to set as active
 */
export function setActiveDocument(documentId: string): void {
  try {
    sessionStorage.setItem(SESSION_KEYS.ACTIVE_DOCUMENT_ID, documentId);
    
    // Dispatch custom event for same-tab synchronization
    window.dispatchEvent(new CustomEvent('active-document-changed', {
      detail: { documentId }
    }));
  } catch (error) {
    console.warn('Failed to set active document in session storage:', error);
  }
}

/**
 * Get the active document ID from session storage
 * @returns The active document ID or null if not set
 */
export function getActiveDocument(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEYS.ACTIVE_DOCUMENT_ID);
  } catch (error) {
    console.warn('Failed to get active document from session storage:', error);
    return null;
  }
}

/**
 * Clear the active document from session storage
 */
export function clearActiveDocument(): void {
  try {
    sessionStorage.removeItem(SESSION_KEYS.ACTIVE_DOCUMENT_ID);
    
    // Dispatch custom event for same-tab synchronization
    window.dispatchEvent(new CustomEvent('active-document-changed', {
      detail: { documentId: null }
    }));
  } catch (error) {
    console.warn('Failed to clear active document from session storage:', error);
  }
}

/**
 * Check if the given document ID is the currently active document
 * @param documentId Document ID to check
 * @returns True if the document is currently active
 */
export function isActiveDocument(documentId: string): boolean {
  return getActiveDocument() === documentId;
} 
