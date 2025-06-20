/**
 * @fileoverview Document import service
 * @module services/document/importService
 * 
 * Dependencies: Firebase Functions, Document service
 * Usage: Handles client-side document importing with progress tracking
 */

import { createDocument } from './documentService';
import { getParseDocumentUrl } from '@/lib/firebase/config';
import type { 
  ImportOperation, 
  ImportFileFormat, 
  ImportStatus,
  TiptapContent 
} from '@/types/document';

// Note: Using direct HTTP calls to Firebase Functions instead of httpsCallable
// for better support of multipart form data uploads

/**
 * Maximum file size: 5MB
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Supported file types
 */
export const SUPPORTED_FILE_TYPES: Record<string, ImportFileFormat> = {
  'text/plain': 'txt',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/pdf': 'pdf'
};

/**
 * Get file format from MIME type
 */
export function getFileFormat(mimeType: string): ImportFileFormat | null {
  return SUPPORTED_FILE_TYPES[mimeType] || null;
}

/**
 * Validate file for import
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`
    };
  }

  // Check file type
  const format = getFileFormat(file.type);
  if (!format) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Supported formats: ${Object.values(SUPPORTED_FILE_TYPES).join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Import operation class for managing import state
 */
export class DocumentImporter {
  private operation: ImportOperation;
  private onProgressUpdate: (operation: ImportOperation) => void;

  constructor(
    file: File,
    onProgressUpdate: (operation: ImportOperation) => void
  ) {
    const format = getFileFormat(file.type);
    if (!format) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    this.operation = {
      id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.name,
      fileSize: file.size,
      format,
      status: 'idle',
      progress: 0,
      message: 'Preparing import...',
      startedAt: new Date()
    };

    this.onProgressUpdate = onProgressUpdate;
  }

  /**
   * Get current operation state
   */
  getOperation(): ImportOperation {
    return { ...this.operation };
  }

  /**
   * Update operation status and notify listeners
   */
  private updateStatus(
    status: ImportStatus,
    progress: number,
    message: string,
    error?: string,
    documentId?: string
  ) {
    this.operation = {
      ...this.operation,
      status,
      progress,
      message,
      error,
      documentId,
      ...(status === 'complete' || status === 'error' ? { completedAt: new Date() } : {})
    };

    this.onProgressUpdate(this.operation);
  }

  /**
   * Start the import process
   */
  async startImport(file: File, userId: string): Promise<string> {
    try {
      // Update status to uploading
      this.updateStatus('uploading', 10, 'Uploading file...');

      // Convert file to form data for upload
      const formData = new FormData();
      formData.append('document', file);

      // Upload and parse the document
      this.updateStatus('parsing', 30, 'Parsing document content...');

      // Call Firebase Function to parse the document
      const functionsUrl = getParseDocumentUrl();
      const endpoint = `${functionsUrl}/parse`;
      
      console.log('Sending request to:', endpoint);
      console.log('File details:', { 
        name: file.name, 
        size: file.size, 
        type: file.type 
      });

      // Create abort controller for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        // Don't set Content-Type header - let browser set it with boundary
      }).finally(() => {
        clearTimeout(timeoutId);
      });

      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        const errorText = await response.text().catch(() => 'Failed to read error response');
        console.error('Error response body:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to parse document');
      }

      this.updateStatus('analyzing', 60, 'Creating document...');

      // Create the document in Firestore
      const documentId = await createDocument(userId, {
        title: result.data.title,
        content: result.data.content as TiptapContent,
        tags: [],
        type: 'general',
        isPublic: false,
        language: 'en'
      });

      this.updateStatus('complete', 100, 'Import completed successfully!', undefined, documentId);

      return documentId;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      this.updateStatus('error', 0, 'Import failed', errorMessage);
      throw error;
    }
  }
}

/**
 * Simple import function for basic use cases
 */
export async function importDocument(
  file: File,
  userId: string,
  onProgress?: (progress: number, message: string) => void
): Promise<string> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const importer = new DocumentImporter(file, (operation) => {
    onProgress?.(operation.progress, operation.message);
  });

  return await importer.startImport(file, userId);
}

/**
 * Get supported file extensions for file input
 */
export function getSupportedFileExtensions(): string {
  const extensions = {
    'txt': '.txt',
    'doc': '.doc',
    'docx': '.docx',
    'pdf': '.pdf'
  };

  return Object.values(extensions).join(',');
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get progress color based on status
 */
export function getProgressColor(status: ImportStatus): string {
  switch (status) {
    case 'complete': return 'text-green-600';
    case 'error': return 'text-red-600';
    case 'analyzing': return 'text-blue-600';
    default: return 'text-primary';
  }
} 
