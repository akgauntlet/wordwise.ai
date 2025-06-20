/**
 * @fileoverview Document export service
 * @module services/document/exportService
 * 
 * Dependencies: Firebase Functions, Document types, Export utilities
 * Usage: Handles both client-side and server-side document exports
 */

import { getGenerateExportUrl } from '@/lib/firebase/config';
import { exportAsTxt, exportAsMarkdown } from '@/utils/documentExport';
import type { 
  TiptapContent, 
  ExportFileFormat, 
  ExportOptions, 
  ExportOperation, 
  ExportStatus 
} from '@/types/document';

// Note: Using direct HTTP calls to Firebase Functions instead of httpsCallable
// for consistency with import service and better error handling

/**
 * Export request data for Firebase Functions
 */
interface ExportRequest {
  documentId: string;
  title: string;
  content: TiptapContent;
  format: ExportFileFormat;
  options: ExportOptions;
}

/**
 * Export response from Firebase Functions
 */
interface ExportResponse {
  success: boolean;
  downloadUrl?: string;
  error?: string;
  fileName?: string;
}

/**
 * Export progress callback type
 */
type ExportProgressCallback = (operation: ExportOperation) => void;

/**
 * Maximum retry attempts for failed exports
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Export timeout in milliseconds (60 seconds)
 */
const EXPORT_TIMEOUT = 60000;

/**
 * Document export service class
 * Handles routing between client-side and server-side export implementations
 */
class DocumentExportService {

  /**
   * Get the HTTP endpoint URL for the export function
   */
  private getHttpEndpointUrl(): string {
    const functionsUrl = getGenerateExportUrl();
    const endpoint = `${functionsUrl}/generate`;
    
    console.log('[ExportService] Using endpoint:', endpoint);
    return endpoint;
  }

  /**
   * Export a document in the specified format
   * Routes to appropriate export method based on format
   * 
   * @param documentId - Document identifier
   * @param title - Document title
   * @param content - Document content
   * @param format - Export format
   * @param options - Export formatting options
   * @param onProgress - Progress callback
   * @returns Promise that resolves when export completes
   */
  async exportDocument(
    documentId: string,
    title: string,
    content: TiptapContent,
    format: ExportFileFormat,
    options: ExportOptions,
    onProgress?: ExportProgressCallback
  ): Promise<void> {
    const operation: ExportOperation = {
      id: this.generateOperationId(),
      documentId,
      format,
      options,
      status: 'idle' as ExportStatus,
      progress: 0,
      startedAt: new Date()
    };

    try {
      // Update progress to starting
      operation.status = 'exporting';
      operation.progress = 10;
      onProgress?.(operation);

      // Route to appropriate export method
      if (this.isClientSideFormat(format)) {
        await this.exportClientSide(title, content, format, operation, onProgress);
      } else {
        await this.exportServerSide(documentId, title, content, format, options, operation, onProgress);
      }

      // Mark as complete
      operation.status = 'complete';
      operation.progress = 100;
      operation.completedAt = new Date();
      onProgress?.(operation);

    } catch (error) {
      operation.status = 'error';
      operation.error = error instanceof Error ? error.message : 'Unknown export error';
      operation.completedAt = new Date();
      onProgress?.(operation);
      throw error;
    }
  }

  /**
   * Handle client-side exports (txt, md)
   * Uses browser-based text generation and download
   */
  private async exportClientSide(
    title: string,
    content: TiptapContent,
    format: ExportFileFormat,
    operation: ExportOperation,
    onProgress?: ExportProgressCallback
  ): Promise<void> {
    // Simulate processing progress
    operation.progress = 50;
    onProgress?.(operation);

    // Add small delay to show progress
    await new Promise(resolve => setTimeout(resolve, 500));

    switch (format) {
      case 'txt':
        exportAsTxt(content, title);
        break;
      case 'md':
        exportAsMarkdown(content, title);
        break;
      default:
        throw new Error(`Unsupported client-side format: ${format}`);
    }

    operation.progress = 90;
    onProgress?.(operation);
  }

  /**
   * Handle server-side exports (docx, pdf)
   * Uses Firebase Functions for document generation via direct HTTP calls
   */
  private async exportServerSide(
    documentId: string,
    title: string,
    content: TiptapContent,
    format: ExportFileFormat,
    options: ExportOptions,
    operation: ExportOperation,
    onProgress?: ExportProgressCallback
  ): Promise<void> {
    let retryCount = 0;
    const maxRetries = MAX_RETRY_ATTEMPTS;

    while (retryCount <= maxRetries) {
      try {
        // Update progress
        operation.progress = 30 + (retryCount * 20);
        onProgress?.(operation);

        const endpoint = this.getHttpEndpointUrl();
        
        console.log('[ExportService] Sending request to:', endpoint);
        console.log('[ExportService] Request data:', {
          documentId,
          title: title.substring(0, 50) + '...',
          format,
          options
        });

        // Create abort controller for timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), EXPORT_TIMEOUT);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId,
            title,
            content,
            format,
            options
          } as ExportRequest),
          signal: controller.signal,
        }).finally(() => {
          clearTimeout(timeoutId);
        });

        if (!response.ok) {
          console.error('[ExportService] Response not OK:', response.status, response.statusText);
          const errorText = await response.text().catch(() => 'Failed to read error response');
          console.error('[ExportService] Error response body:', errorText);
          
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
          }
          
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result: ExportResponse = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Export failed');
        }

        // Update progress
        operation.progress = 80;
        onProgress?.(operation);

        // Trigger download if URL provided
        if (result.downloadUrl && result.fileName) {
          await this.downloadFile(result.downloadUrl, result.fileName);
        }

        return; // Success - exit retry loop

      } catch (error) {
        retryCount++;
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[ExportService] Attempt ${retryCount} failed:`, errorMessage);
        
        if (retryCount > maxRetries) {
          throw new Error(`Export failed after ${maxRetries} attempts: ${errorMessage}`);
        }

        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        console.log(`[ExportService] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Download file from URL
   */
  private async downloadFile(url: string, filename: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      throw new Error(`File download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if format is handled client-side
   */
  private isClientSideFormat(format: ExportFileFormat): boolean {
    return format === 'txt' || format === 'md';
  }

  /**
   * Generate unique operation ID
   */
  private generateOperationId(): string {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get supported export formats
   */
  getSupportedFormats(): ExportFileFormat[] {
    return ['txt', 'md', 'docx', 'pdf'];
  }

  /**
   * Check if a format requires server processing
   */
  requiresServerProcessing(format: ExportFileFormat): boolean {
    return !this.isClientSideFormat(format);
  }
}

/**
 * Export service singleton instance
 */
export const exportService = new DocumentExportService();

/**
 * Export individual functions for direct use
 */
export { exportAsTxt, exportAsMarkdown } from '@/utils/documentExport'; 
