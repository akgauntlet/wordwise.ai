/**
 * @fileoverview Document export dialog component
 * @module components/editor/DocumentExportDialog
 * 
 * Dependencies: React, Radix UI Dialog, Shadcn UI components, Document types
 * Usage: Provides UI for selecting export format and customization options
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Download, FileText, FileCode, File, FileImage } from 'lucide-react';
import type { 
  ExportFileFormat, 
  ExportPreset, 
  ExportOptions 
} from '@/types/document';
import { EXPORT_PRESETS } from '@/types/document';

/**
 * Export dialog props
 */
interface DocumentExportDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Close dialog callback */
  onClose: () => void;
  /** Export callback with format and options */
  onExport: (format: ExportFileFormat, options: ExportOptions) => void;
  /** Document title for preview */
  documentTitle: string;
  /** Whether export is in progress */
  isExporting?: boolean;
}

/**
 * Format configuration with display information
 */
interface FormatConfig {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  clientSide: boolean;
}

/**
 * Available export formats with metadata
 */
const EXPORT_FORMATS: Record<ExportFileFormat, FormatConfig> = {
  txt: {
    label: 'Plain Text',
    description: 'Simple text file without formatting',
    icon: FileText,
    clientSide: true
  },
  md: {
    label: 'Markdown',
    description: 'Markdown file with basic formatting preserved',
    icon: FileCode,
    clientSide: true
  },
  docx: {
    label: 'Word Document',
    description: 'Microsoft Word document with full formatting',
    icon: File,
    clientSide: false
  },
  pdf: {
    label: 'PDF',
    description: 'Portable Document Format with professional layout',
    icon: FileImage,
    clientSide: false
  }
};

/**
 * Document export dialog component
 * Provides comprehensive export options with format selection and customization
 * 
 * @param isOpen - Whether dialog is open
 * @param onClose - Close dialog callback
 * @param onExport - Export callback with format and options
 * @param documentTitle - Document title for preview
 * @param isExporting - Whether export is in progress
 */
export function DocumentExportDialog({
  isOpen,
  onClose,
  onExport,
  documentTitle,
  isExporting = false
}: DocumentExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFileFormat>('pdf');
  const [selectedPreset, setSelectedPreset] = useState<ExportPreset>('default');
  const [customOptions, setCustomOptions] = useState<ExportOptions>(EXPORT_PRESETS.default);

  /**
   * Handle preset change and update custom options
   */
  const handlePresetChange = (preset: ExportPreset) => {
    setSelectedPreset(preset);
    setCustomOptions(EXPORT_PRESETS[preset]);
  };

  /**
   * Handle custom option changes
   */
  const updateCustomOption = <K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K]
  ) => {
    setCustomOptions(prev => ({
      ...prev,
      [key]: value
    }));
    // Reset preset to custom when manual changes are made
    if (selectedPreset !== 'default' || JSON.stringify(customOptions) !== JSON.stringify(EXPORT_PRESETS[selectedPreset])) {
      setSelectedPreset('default');
    }
  };

  /**
   * Handle margin updates
   */
  const updateMargin = (side: keyof ExportOptions['margins'], value: number) => {
    setCustomOptions(prev => ({
      ...prev,
      margins: {
        ...prev.margins,
        [side]: value
      }
    }));
  };

  /**
   * Handle export action
   */
  const handleExport = () => {
    onExport(selectedFormat, customOptions);
  };

  /**
   * Reset dialog state when closed
   */
  const handleClose = () => {
    if (!isExporting) {
      onClose();
    }
  };



  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Document
          </DialogTitle>
          <DialogDescription>
            Export "{documentTitle}" in your preferred format with custom formatting options.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Format</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(EXPORT_FORMATS).map(([format, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format as ExportFileFormat)}
                    className={`p-4 rounded-lg border-2 transition-colors text-left ${
                      selectedFormat === format
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-border/80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium">{config.label}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {config.description}
                        </div>
                        {!config.clientSide && (
                          <div className="text-xs text-blue-600 mt-1">
                            Server processing required
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formatting Options (only for formatted exports) */}
          {(selectedFormat === 'docx' || selectedFormat === 'pdf') && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Formatting Options</Label>

              {/* Preset Selection */}
              <div className="space-y-2">
                <Label htmlFor="preset-select">Preset</Label>
                <Select value={selectedPreset} onValueChange={handlePresetChange}>
                  <SelectTrigger id="preset-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select 
                    value={customOptions.fontFamily} 
                    onValueChange={(value) => updateCustomOption('fontFamily', value)}
                  >
                    <SelectTrigger id="font-family">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Calibri">Calibri</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size (pt)</Label>
                  <Input
                    id="font-size"
                    type="number"
                    min="8"
                    max="24"
                    value={customOptions.fontSize}
                    onChange={(e) => updateCustomOption('fontSize', parseInt(e.target.value) || 12)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="line-spacing">Line Spacing</Label>
                <Select 
                  value={customOptions.lineSpacing.toString()} 
                  onValueChange={(value) => updateCustomOption('lineSpacing', parseFloat(value))}
                >
                  <SelectTrigger id="line-spacing">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.0">Single (1.0)</SelectItem>
                    <SelectItem value="1.15">1.15</SelectItem>
                    <SelectItem value="1.5">1.5</SelectItem>
                    <SelectItem value="2.0">Double (2.0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Margins */}
              <div className="space-y-3">
                <Label>Margins (inches)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="margin-top" className="text-sm">Top</Label>
                    <Input
                      id="margin-top"
                      type="number"
                      step="0.25"
                      min="0.25"
                      max="3"
                      value={customOptions.margins.top}
                      onChange={(e) => updateMargin('top', parseFloat(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="margin-bottom" className="text-sm">Bottom</Label>
                    <Input
                      id="margin-bottom"
                      type="number"
                      step="0.25"
                      min="0.25"
                      max="3"
                      value={customOptions.margins.bottom}
                      onChange={(e) => updateMargin('bottom', parseFloat(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="margin-left" className="text-sm">Left</Label>
                    <Input
                      id="margin-left"
                      type="number"
                      step="0.25"
                      min="0.25"
                      max="3"
                      value={customOptions.margins.left}
                      onChange={(e) => updateMargin('left', parseFloat(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="margin-right" className="text-sm">Right</Label>
                    <Input
                      id="margin-right"
                      type="number"
                      step="0.25"
                      min="0.25"
                      max="3"
                      value={customOptions.margins.right}
                      onChange={(e) => updateMargin('right', parseFloat(e.target.value) || 1)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting}
            className="min-w-[100px]"
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
