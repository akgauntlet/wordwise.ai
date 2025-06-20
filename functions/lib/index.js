"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeTextRealtime = exports.analyzeText = void 0;
const app_1 = require("firebase-admin/app");
// Initialize Firebase Admin SDK
(0, app_1.initializeApp)();
// Export all functions
var analyzeText_1 = require("./ai/analyzeText");
Object.defineProperty(exports, "analyzeText", { enumerable: true, get: function () { return analyzeText_1.analyzeText; } });
var analyzeTextRealtime_1 = require("./ai/analyzeTextRealtime");
Object.defineProperty(exports, "analyzeTextRealtime", { enumerable: true, get: function () { return analyzeTextRealtime_1.analyzeTextRealtime; } });
// Future functions will be exported here as they are implemented:
// export { parseDocument } from './document/parseDocument';
// export { generateExport } from './document/generateExport';
// export { manageVersions } from './document/manageVersions';
// export { cleanupCache } from './maintenance/cleanupCache';
// export { rateLimitCleanup } from './maintenance/rateLimitCleanup'; 
//# sourceMappingURL=index.js.map