/**
 * @fileoverview Document service for Firebase operations
 * @module services/document/documentService
 * 
 * Dependencies: Firebase Firestore, Document types
 * Usage: CRUD operations and auto-save functionality for documents
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { 
  Document, 
  DocumentFormData, 
  TiptapContent,
  DocumentFilter,
  DocumentVersion 
} from "@/types/document";

/**
 * Document limit per user
 */
export const DOCUMENT_LIMIT = 100;

/**
 * Version limit per document  
 */
export const VERSION_LIMIT = 50;

/**
 * Auto-save interval in milliseconds (2 minutes)
 */
export const AUTO_SAVE_INTERVAL = 2 * 60 * 1000;

/**
 * Convert plain text from Tiptap content
 */
function extractPlainText(content: TiptapContent): string {
  // Handle text nodes
  if (content.text) {
    return content.text;
  }
  
  // Handle nodes with content array
  if (content.content && Array.isArray(content.content)) {
    if (content.content.length === 0) {
      return '';
    }
    
    const texts = content.content.map(extractPlainText).filter(text => text.length > 0);
    
    // Add line breaks for block elements
    if (content.type === 'paragraph' || content.type === 'heading') {
      return texts.join('') + '\n';
    }
    
    return texts.join('');
  }
  
  return '';
}

/**
 * Count words in plain text
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Create a new document
 */
export async function createDocument(
  userId: string,
  formData: Partial<DocumentFormData> = {}
): Promise<string> {
  try {
    // Check document limit
    const userDocsQuery = query(
      collection(db, "documents"),
      where("userId", "==", userId)
    );
    const userDocsSnapshot = await getDocs(userDocsQuery);
    
    if (userDocsSnapshot.size >= DOCUMENT_LIMIT) {
      throw new Error(`Document limit of ${DOCUMENT_LIMIT} reached`);
    }

    const defaultContent: TiptapContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: []
        }
      ]
    };

    const rawPlainText = formData.content ? extractPlainText(formData.content) : '';
    const plainText = rawPlainText.replace(/\s+/g, ' ').trim(); // Normalize whitespace
    const wordCount = countWords(plainText);

    const documentData = {
      title: formData.title || "Untitled Document",
      content: formData.content || defaultContent,
      plainText,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      wordCount,
      characterCount: plainText.length,
      tags: formData.tags || [],
      type: formData.type || "general" as const,
      isPublic: false,
      language: formData.language || "en"
    };

    const docRef = await addDoc(collection(db, "documents"), documentData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
}

/**
 * Create a version snapshot of the current document
 */
export async function createDocumentVersion(
  documentId: string,
  content: TiptapContent,
  plainText: string,
  wordCount: number,
  characterCount: number
): Promise<void> {
  try {
    // Get current version count for this document
    const versionsQuery = query(
      collection(db, "document_versions"),
      where("documentId", "==", documentId),
      orderBy("version", "desc"),
      limit(1)
    );
    
    const versionsSnapshot = await getDocs(versionsQuery);
    let nextVersion = 1;
    
    if (!versionsSnapshot.empty) {
      const latestVersion = versionsSnapshot.docs[0].data() as DocumentVersion;
      nextVersion = latestVersion.version + 1;
    }

    // Create the new version
    const versionData: Omit<DocumentVersion, 'id'> = {
      documentId,
      version: nextVersion,
      content,
      plainText,
      createdAt: serverTimestamp() as Timestamp,
      wordCount,
      characterCount
    };

    await addDoc(collection(db, "document_versions"), versionData);

    // Clean up old versions if we exceed the limit
    await cleanupOldVersions(documentId);
  } catch (error) {
    console.error("Error creating document version:", error);
    throw error;
  }
}

/**
 * Clean up old versions when limit is exceeded
 */
async function cleanupOldVersions(documentId: string): Promise<void> {
  try {
    const versionsQuery = query(
      collection(db, "document_versions"),
      where("documentId", "==", documentId),
      orderBy("version", "desc")
    );
    
    const versionsSnapshot = await getDocs(versionsQuery);
    
    if (versionsSnapshot.size > VERSION_LIMIT) {
      const batch = writeBatch(db);
      const versionsToDelete = versionsSnapshot.docs.slice(VERSION_LIMIT);
      
      versionsToDelete.forEach(versionDoc => {
        batch.delete(versionDoc.ref);
      });
      
      await batch.commit();
    }
  } catch (error) {
    console.error("Error cleaning up old versions:", error);
  }
}

/**
 * Get all versions for a document
 */
export async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  try {
    const versionsQuery = query(
      collection(db, "document_versions"),
      where("documentId", "==", documentId),
      orderBy("version", "desc")
    );
    
    const snapshot = await getDocs(versionsQuery);
    const versions: DocumentVersion[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      versions.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt as Timestamp
      } as DocumentVersion);
    });
    
    return versions;
  } catch (error) {
    console.error("Error getting document versions:", error);
    throw error;
  }
}

/**
 * Get a specific version by ID
 */
export async function getDocumentVersion(versionId: string): Promise<DocumentVersion | null> {
  try {
    const versionRef = doc(db, "document_versions", versionId);
    const versionSnap = await getDoc(versionRef);
    
    if (!versionSnap.exists()) {
      return null;
    }
    
    const data = versionSnap.data();
    return {
      id: versionSnap.id,
      ...data,
      createdAt: data.createdAt as Timestamp
    } as DocumentVersion;
  } catch (error) {
    console.error("Error getting document version:", error);
    throw error;
  }
}

/**
 * Delete all versions for a document (used when document is deleted)
 */
export async function deleteDocumentVersions(documentId: string): Promise<void> {
  try {
    const versionsQuery = query(
      collection(db, "document_versions"),
      where("documentId", "==", documentId)
    );
    
    const versionsSnapshot = await getDocs(versionsQuery);
    const batch = writeBatch(db);
    
    versionsSnapshot.docs.forEach(versionDoc => {
      batch.delete(versionDoc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Error deleting document versions:", error);
    throw error;
  }
}

/**
 * Update an existing document
 */
export async function updateDocument(
  documentId: string,
  updates: Partial<Document>
): Promise<void> {
  try {
    const docRef = doc(db, "documents", documentId);
    
    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    // Update plain text and counts if content changed
    if (updates.content) {
      const rawPlainText = extractPlainText(updates.content);
      const plainText = rawPlainText.replace(/\s+/g, ' ').trim(); // Normalize whitespace
      updateData.plainText = plainText;
      updateData.wordCount = countWords(plainText);
      updateData.characterCount = plainText.length;

      // Create a version snapshot whenever content changes
      await createDocumentVersion(
        documentId,
        updates.content,
        plainText,
        updateData.wordCount,
        updateData.characterCount
      );
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string): Promise<void> {
  try {
    // Delete all versions first
    await deleteDocumentVersions(documentId);
    
    // Then delete the document
    const docRef = doc(db, "documents", documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
}

/**
 * Get all documents for a user
 */
export async function getUserDocuments(
  userId: string,
  filter?: DocumentFilter
): Promise<Document[]> {
  try {
    let documentsQuery = query(
      collection(db, "documents"),
      where("userId", "==", userId)
    );

    // Apply filters
    if (filter?.type) {
      documentsQuery = query(documentsQuery, where("type", "==", filter.type));
    }

    // Apply sorting
    const sortField = filter?.sort?.field || "updatedAt";
    const sortDirection = filter?.sort?.direction || "desc";
    documentsQuery = query(documentsQuery, orderBy(sortField, sortDirection));

    const snapshot = await getDocs(documentsQuery);
    const documents: Document[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      documents.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt as Timestamp,
        updatedAt: data.updatedAt as Timestamp
      } as Document);
    });

    // Apply client-side filters
    let filteredDocs = documents;

    if (filter?.search) {
      const searchTerm = filter.search.toLowerCase();
      filteredDocs = filteredDocs.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.plainText.toLowerCase().includes(searchTerm)
      );
    }

    if (filter?.tags && filter.tags.length > 0) {
      filteredDocs = filteredDocs.filter(doc =>
        filter.tags!.some(tag => doc.tags.includes(tag))
      );
    }

    if (filter?.dateRange) {
      filteredDocs = filteredDocs.filter(doc => {
        const docDate = doc.updatedAt.toDate();
        return docDate >= filter.dateRange!.start && docDate <= filter.dateRange!.end;
      });
    }

    return filteredDocs;
  } catch (error) {
    console.error("Error getting user documents:", error);
    throw error;
  }
}

/**
 * Get a single document by ID
 */
export async function getDocument(documentId: string): Promise<Document | null> {
  try {
    const docRef = doc(db, "documents", documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt as Timestamp,
      updatedAt: data.updatedAt as Timestamp
    } as Document;
  } catch (error) {
    console.error("Error getting document:", error);
    throw error;
  }
}

/**
 * Subscribe to real-time document updates
 */
export function subscribeToDocument(
  documentId: string,
  callback: (document: Document | null) => void
): () => void {
  const docRef = doc(db, "documents", documentId);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt as Timestamp,
        updatedAt: data.updatedAt as Timestamp
      } as Document);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Error in document subscription:", error);
  });
}

/**
 * Subscribe to real-time user documents updates
 */
export function subscribeToUserDocuments(
  userId: string,
  callback: (documents: Document[]) => void
): () => void {
  const documentsQuery = query(
    collection(db, "documents"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  
  return onSnapshot(documentsQuery, (snapshot) => {
    const documents: Document[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      documents.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt as Timestamp,
        updatedAt: data.updatedAt as Timestamp
      } as Document);
    });
    callback(documents);
  }, (error) => {
    console.error("Error in user documents subscription:", error);
  });
}

/**
 * Auto-save with retry logic
 */
export class AutoSaver {
  private documentId: string;
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second
  
  constructor(documentId: string) {
    this.documentId = documentId;
  }

  async save(content: TiptapContent, title?: string): Promise<void> {
    try {
      const updates: Partial<Document> = { content };
      if (title) updates.title = title;
      
      await updateDocument(this.documentId, updates);
      this.retryCount = 0; // Reset on successful save
    } catch (error) {
      console.error("Auto-save failed:", error);
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = this.retryDelay * Math.pow(2, this.retryCount - 1); // Exponential backoff
        
        setTimeout(() => {
          this.save(content, title);
        }, delay);
      } else {
        // Max retries reached, throw error to show to user
        throw new Error("Auto-save failed after multiple attempts. Please check your connection.");
      }
    }
  }
} 
