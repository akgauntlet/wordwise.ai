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

import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
initializeApp();

// Export all functions
export { analyzeText } from './ai/analyzeText';
export { analyzeTextRealtime } from './ai/analyzeTextRealtime';

// Future functions will be exported here as they are implemented:
// export { parseDocument } from './document/parseDocument';
// export { generateExport } from './document/generateExport';
// export { manageVersions } from './document/manageVersions';
// export { cleanupCache } from './maintenance/cleanupCache';
// export { rateLimitCleanup } from './maintenance/rateLimitCleanup'; 
