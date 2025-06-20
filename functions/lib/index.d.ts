/**
 * @fileoverview Main entry point for WordWise.ai Firebase Functions
 * @module index
 * @author WordWise.ai Team
 * @created 2024-01-XX
 *
 * Dependencies:
 * - Firebase Functions SDK
 * - Firebase Admin SDK
 * - All function modules
 *
 * Usage:
 * - Entry point for all Firebase Functions
 * - Exports all callable and scheduled functions
 * - Handles global initialization and configuration
 */
export { analyzeText } from './ai/analyzeText';
export { analyzeTextRealtime } from './ai/analyzeTextRealtime';
export { parseDocument } from './document/parseDocument';
export { generateExport, generateExportHttp, downloadExport } from './document/generateExport';
//# sourceMappingURL=index.d.ts.map