/**
 * @fileoverview Document export generation Firebase Function
 * @module functions/document/generateExport
 *
 * Dependencies: Firebase Functions, Firebase Admin, docx, jsPDF
 * Usage: Generates document exports in .docx and .pdf formats
 */
import type { TiptapContent } from '../types/document';
/**
 * Export request data
 */
interface ExportRequest {
    documentId: string;
    title: string;
    content: TiptapContent;
    format: 'docx' | 'pdf';
    options: {
        fontFamily: string;
        fontSize: number;
        lineSpacing: number;
        margins: {
            top: number;
            bottom: number;
            left: number;
            right: number;
        };
    };
}
/**
 * Export response data
 */
interface ExportResponse {
    success: boolean;
    downloadUrl?: string;
    fileName?: string;
    error?: string;
}
/**
 * Firebase Function to generate document exports (Callable)
 */
export declare const generateExport: import("firebase-functions/v2/https").CallableFunction<ExportRequest, Promise<ExportResponse>>;
/**
 * HTTP endpoint version for better CORS handling (fallback)
 */
export declare const generateExportHttp: import("firebase-functions/v2/https").HttpsFunction;
/**
 * Download export file endpoint - streams files with proper CORS headers
 */
export declare const downloadExport: import("firebase-functions/v2/https").HttpsFunction;
export {};
//# sourceMappingURL=generateExport.d.ts.map