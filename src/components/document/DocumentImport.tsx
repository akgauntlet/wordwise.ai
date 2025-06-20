/**
 * @fileoverview Document import component
 * @module components/document/DocumentImport
 * 
 * Dependencies: React, UI components, Import service, Authentication
 * Usage: Provides file upload interface with progress tracking for document imports
 */

import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/auth/useAuth';
import { 
  DocumentImporter,
  validateFile,
  getSupportedFileExtensions,
  formatFileSize,
  getProgressColor,
  MAX_FILE_SIZE
} from '@/services/document/importService';
import { setActiveDocument } from '@/lib/utils';
import type { ImportOperation } from '@/types/document';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Loader2,
  AlertCircle,
  File
} from 'lucide-react';

/**
 * Document import component props
 */
interface DocumentImportProps {
  /** Called when import completes successfully */
  onImportComplete?: (documentId: string) => void;
  /** Called when import is cancelled */
  onCancel?: () => void;
  /** Whether to show as a dialog/modal */
  compact?: boolean;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Document import component with file upload and progress tracking
 */
export function DocumentImport({ 
  onImportComplete, 
  onCancel, 
  compact = false,
  className = '' 
}: DocumentImportProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importOperation, setImportOperation] = useState<ImportOperation | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }
    
    setSelectedFile(file);
  }, []);

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  /**
   * Handle drag events
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  /**
   * Handle file drop
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  /**
   * Start the import process
   */
  const handleStartImport = useCallback(async () => {
    if (!selectedFile || !user) return;

    setError(null);
    
    const importer = new DocumentImporter(selectedFile, (operation) => {
      setImportOperation(operation);
    });

    try {
      const documentId = await importer.startImport(selectedFile, user.uid);
      
      // Set as active document and navigate or callback
      setActiveDocument(documentId);
      
      if (onImportComplete) {
        onImportComplete(documentId);
      } else {
        navigate(`/editor/${documentId}`);
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Import failed');
    }
  }, [selectedFile, user, onImportComplete, navigate]);

  /**
   * Reset the import state
   */
  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setImportOperation(null);
    setError(null);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  /**
   * Open file picker
   */
  const handleOpenFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const isImporting = importOperation && 
    (importOperation.status === 'uploading' || 
     importOperation.status === 'parsing' || 
     importOperation.status === 'analyzing');

  const importComplete = importOperation?.status === 'complete';
  const importError = importOperation?.status === 'error';

  if (compact && importComplete) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Document imported successfully! Redirecting to editor...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Document
        </CardTitle>
        <CardDescription>
          Upload a document to import into WordWise.ai. 
          Supported formats: TXT, DOC, DOCX, PDF (max {MAX_FILE_SIZE / (1024 * 1024)}MB)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error display */}
        {(error || importError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || importOperation?.error}
            </AlertDescription>
          </Alert>
        )}

        {/* File selection area */}
        {!selectedFile && !isImporting && !importComplete && (
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleOpenFilePicker}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              Drag and drop your document here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files
            </p>
            <Button variant="outline" type="button">
              Choose File
            </Button>
          </div>
        )}

        {/* Selected file display */}
        {selectedFile && !isImporting && !importComplete && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <File className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleStartImport} disabled={!user}>
                <FileText className="h-4 w-4 mr-2" />
                Import Document
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Choose Different File
              </Button>
            </div>
          </div>
        )}

        {/* Import progress */}
        {importOperation && isImporting && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">Importing {selectedFile?.name}</p>
                <p className={`text-sm ${getProgressColor(importOperation.status)}`}>
                  {importOperation.message}
                </p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${importOperation.progress}%` }}
              />
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              {importOperation.progress}% complete
            </p>
          </div>
        )}

        {/* Success state */}
        {importComplete && (
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-800">Import completed!</p>
                <p className="text-sm text-green-700">
                  Your document has been imported and is ready for editing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cancel button */}
        {onCancel && (
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={getSupportedFileExtensions()}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
} 
