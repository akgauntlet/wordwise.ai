"use strict";
/**
 * @fileoverview Document export generation Firebase Function
 * @module functions/document/generateExport
 *
 * Dependencies: Firebase Functions, Firebase Admin, docx, jsPDF
 * Usage: Generates document exports in .docx and .pdf formats
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadExport = exports.generateExportHttp = exports.generateExport = void 0;
const https_1 = require("firebase-functions/v2/https");
const storage_1 = require("firebase-admin/storage");
const docx_1 = require("docx");
const jspdf_1 = require("jspdf");
const cors_1 = __importDefault(require("cors"));
/**
 * Get the base URL for Firebase Functions
 */
function getFunctionsBaseUrl() {
    // Check various indicators that we're running in emulator
    const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true' ||
        process.env.NODE_ENV === 'development' ||
        !!process.env.FIREBASE_EMULATOR_HUB;
    return isEmulator
        ? 'http://localhost:5001/wordwise-ai-2024-12/us-central1'
        : 'https://us-central1-wordwise-ai-2024-12.cloudfunctions.net';
}
// Initialize CORS with proper configuration
const corsHandler = (0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://wordwise-ai-2024-12.web.app',
        'https://wordwise-ai-2024-12.firebaseapp.com'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    credentials: true
});
/**
 * Convert Tiptap content to plain text with formatting info
 */
function extractTextWithFormatting(content) {
    const result = [];
    function processNode(node, isNewParagraph = false) {
        var _a;
        if (node.text) {
            const marks = node.marks || [];
            const formatting = {
                text: node.text,
                bold: marks.some(m => m.type === 'bold'),
                italic: marks.some(m => m.type === 'italic'),
                underline: marks.some(m => m.type === 'underline'),
                isNewParagraph
            };
            result.push(formatting);
        }
        if (node.content) {
            for (const child of node.content) {
                if (node.type === 'heading') {
                    const level = typeof ((_a = node.attrs) === null || _a === void 0 ? void 0 : _a.level) === 'number' ? node.attrs.level : 1;
                    processNode(child);
                    if (result.length > 0) {
                        result[result.length - 1].heading = level;
                        result[result.length - 1].isNewParagraph = true;
                    }
                }
                else if (node.type === 'paragraph') {
                    processNode(child, true);
                }
                else {
                    processNode(child);
                }
            }
        }
    }
    processNode(content);
    return result;
}
/**
 * Generate DOCX document from Tiptap content
 */
async function generateDocx(title, content, options) {
    const textData = extractTextWithFormatting(content);
    const children = [];
    // Add title
    children.push(new docx_1.Paragraph({
        children: [
            new docx_1.TextRun({
                text: title,
                bold: true,
                size: Math.round(options.fontSize * 1.5 * 2), // Convert to half-points
                font: options.fontFamily
            })
        ],
        heading: docx_1.HeadingLevel.TITLE,
        alignment: docx_1.AlignmentType.CENTER,
        spacing: { after: 400 }
    }));
    // Process content
    let currentParagraph = [];
    let isHeading = false;
    let headingLevel = 1;
    for (const item of textData) {
        if (item.isNewParagraph || item.heading) {
            // Finish current paragraph
            if (currentParagraph.length > 0) {
                children.push(new docx_1.Paragraph({
                    children: currentParagraph,
                    heading: isHeading ? (headingLevel === 1 ? docx_1.HeadingLevel.HEADING_1 :
                        headingLevel === 2 ? docx_1.HeadingLevel.HEADING_2 :
                            headingLevel === 3 ? docx_1.HeadingLevel.HEADING_3 :
                                headingLevel === 4 ? docx_1.HeadingLevel.HEADING_4 :
                                    headingLevel === 5 ? docx_1.HeadingLevel.HEADING_5 :
                                        docx_1.HeadingLevel.HEADING_6) : undefined,
                    spacing: {
                        line: Math.round(options.lineSpacing * 240),
                        after: 120
                    }
                }));
            }
            // Start new paragraph
            currentParagraph = [];
            isHeading = !!item.heading;
            headingLevel = item.heading || 1;
        }
        // Add text run
        currentParagraph.push(new docx_1.TextRun({
            text: item.text,
            bold: item.bold,
            italics: item.italic,
            underline: item.underline ? {} : undefined,
            size: Math.round((isHeading ? options.fontSize * 1.2 : options.fontSize) * 2), // Convert to half-points
            font: options.fontFamily
        }));
    }
    // Add final paragraph
    if (currentParagraph.length > 0) {
        children.push(new docx_1.Paragraph({
            children: currentParagraph,
            heading: isHeading ? (headingLevel === 1 ? docx_1.HeadingLevel.HEADING_1 :
                headingLevel === 2 ? docx_1.HeadingLevel.HEADING_2 :
                    headingLevel === 3 ? docx_1.HeadingLevel.HEADING_3 :
                        headingLevel === 4 ? docx_1.HeadingLevel.HEADING_4 :
                            headingLevel === 5 ? docx_1.HeadingLevel.HEADING_5 :
                                docx_1.HeadingLevel.HEADING_6) : undefined,
            spacing: {
                line: Math.round(options.lineSpacing * 240)
            }
        }));
    }
    const doc = new docx_1.Document({
        sections: [{
                properties: {
                    page: {
                        margin: {
                            top: Math.round(options.margins.top * 1440), // Convert inches to twips
                            bottom: Math.round(options.margins.bottom * 1440),
                            left: Math.round(options.margins.left * 1440),
                            right: Math.round(options.margins.right * 1440)
                        }
                    }
                },
                children
            }]
    });
    return await docx_1.Packer.toBuffer(doc);
}
/**
 * Generate PDF document from Tiptap content
 */
async function generatePdf(title, content, options) {
    const textData = extractTextWithFormatting(content);
    const pdf = new jspdf_1.jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
    });
    // Set margins
    const marginTop = options.margins.top;
    const marginBottom = options.margins.bottom;
    const marginLeft = options.margins.left;
    const marginRight = options.margins.right;
    const pageWidth = 8.5;
    const pageHeight = 11;
    const contentWidth = pageWidth - marginLeft - marginRight;
    let currentY = marginTop;
    let currentX = marginLeft;
    // Set initial font
    pdf.setFont(options.fontFamily.toLowerCase().replace(' ', ''), 'normal');
    // Add title
    pdf.setFontSize(Math.round(options.fontSize * 1.5));
    pdf.setFont(options.fontFamily.toLowerCase().replace(' ', ''), 'bold');
    const titleLines = pdf.splitTextToSize(title, contentWidth);
    for (const line of titleLines) {
        if (currentY + 0.3 > pageHeight - marginBottom) {
            pdf.addPage();
            currentY = marginTop;
        }
        // Center the title
        const titleWidth = pdf.getTextWidth(line);
        const titleX = marginLeft + (contentWidth - titleWidth) / 2;
        pdf.text(line, titleX, currentY);
        currentY += 0.3;
    }
    currentY += 0.2; // Extra space after title
    // Process content
    for (const item of textData) {
        if (item.isNewParagraph && currentY > marginTop + 0.3) {
            currentY += 0.2; // Paragraph spacing
        }
        // Set font properties
        let fontStyle = 'normal';
        if (item.bold && item.italic)
            fontStyle = 'bolditalic';
        else if (item.bold)
            fontStyle = 'bold';
        else if (item.italic)
            fontStyle = 'italic';
        const fontSize = item.heading ?
            Math.round(options.fontSize * (1.3 - (item.heading - 1) * 0.1)) :
            options.fontSize;
        pdf.setFont(options.fontFamily.toLowerCase().replace(' ', ''), fontStyle);
        pdf.setFontSize(fontSize);
        // Split text to fit line width
        const lines = pdf.splitTextToSize(item.text, contentWidth);
        for (const line of lines) {
            // Check if we need a new page
            if (currentY + (fontSize / 72) > pageHeight - marginBottom) {
                pdf.addPage();
                currentY = marginTop;
            }
            pdf.text(line, currentX, currentY);
            currentY += (fontSize / 72) * options.lineSpacing;
        }
    }
    return Buffer.from(pdf.output('arraybuffer'));
}
/**
 * Firebase Function to generate document exports (Callable)
 */
exports.generateExport = (0, https_1.onCall)({
    cors: true,
    enforceAppCheck: false,
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 300
}, async (request) => {
    try {
        const { documentId, title, content, format, options } = request.data;
        // Validate request
        if (!documentId || !title || !content || !format || !options) {
            throw new https_1.HttpsError('invalid-argument', 'Missing required parameters');
        }
        if (!['docx', 'pdf'].includes(format)) {
            throw new https_1.HttpsError('invalid-argument', 'Unsupported export format');
        }
        // Generate document
        let buffer;
        let mimeType;
        let fileExtension;
        if (format === 'docx') {
            buffer = await generateDocx(title, content, options);
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            fileExtension = 'docx';
        }
        else {
            buffer = await generatePdf(title, content, options);
            mimeType = 'application/pdf';
            fileExtension = 'pdf';
        }
        // Upload to Firebase Storage
        const storage = (0, storage_1.getStorage)();
        const bucket = storage.bucket();
        const cleanTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${cleanTitle}.${fileExtension}`;
        const filePath = `exports/${documentId}/${Date.now()}_${fileName}`;
        const file = bucket.file(filePath);
        await file.save(buffer, {
            metadata: {
                contentType: mimeType,
                metadata: {
                    documentId,
                    originalTitle: title,
                    exportFormat: format,
                    createdAt: new Date().toISOString()
                }
            }
        });
        // Instead of returning a storage URL, return a download token
        // The file will be streamed through the function's download endpoint
        const downloadToken = Buffer.from(JSON.stringify({
            filePath,
            fileName,
            mimeType,
            timestamp: Date.now()
        })).toString('base64');
        return {
            success: true,
            downloadUrl: `${getFunctionsBaseUrl()}/downloadExport?token=${downloadToken}`,
            fileName
        };
    }
    catch (error) {
        console.error('Export generation failed:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', `Export generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
});
/**
 * HTTP endpoint version for better CORS handling (fallback)
 */
exports.generateExportHttp = (0, https_1.onRequest)({
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 300
}, async (req, res) => {
    // Handle CORS
    await new Promise((resolve, reject) => {
        corsHandler(req, res, (error) => {
            if (error)
                reject(error);
            else
                resolve();
        });
    });
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    // Only allow POST
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { documentId, title, content, format, options } = req.body;
        // Validate request
        if (!documentId || !title || !content || !format || !options) {
            res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            });
            return;
        }
        if (!['docx', 'pdf'].includes(format)) {
            res.status(400).json({
                success: false,
                error: 'Unsupported export format'
            });
            return;
        }
        // Generate document (reuse existing logic)
        let buffer;
        let mimeType;
        let fileExtension;
        if (format === 'docx') {
            buffer = await generateDocx(title, content, options);
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            fileExtension = 'docx';
        }
        else {
            buffer = await generatePdf(title, content, options);
            mimeType = 'application/pdf';
            fileExtension = 'pdf';
        }
        // Upload to Firebase Storage
        const storage = (0, storage_1.getStorage)();
        const bucket = storage.bucket();
        const cleanTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${cleanTitle}.${fileExtension}`;
        const filePath = `exports/${documentId}/${Date.now()}_${fileName}`;
        const file = bucket.file(filePath);
        await file.save(buffer, {
            metadata: {
                contentType: mimeType,
                metadata: {
                    documentId,
                    originalTitle: title,
                    exportFormat: format,
                    createdAt: new Date().toISOString()
                }
            }
        });
        // Instead of returning a storage URL, return a download token
        const downloadToken = Buffer.from(JSON.stringify({
            filePath,
            fileName,
            mimeType,
            timestamp: Date.now()
        })).toString('base64');
        res.status(200).json({
            success: true,
            downloadUrl: `${getFunctionsBaseUrl()}/downloadExport?token=${downloadToken}`,
            fileName
        });
    }
    catch (error) {
        console.error('Export generation failed:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * Download export file endpoint - streams files with proper CORS headers
 */
exports.downloadExport = (0, https_1.onRequest)({
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60
}, async (req, res) => {
    // Handle CORS
    await new Promise((resolve, reject) => {
        corsHandler(req, res, (error) => {
            if (error)
                reject(error);
            else
                resolve();
        });
    });
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    // Only allow GET
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const token = req.query.token;
        if (!token) {
            res.status(400).json({ error: 'Missing download token' });
            return;
        }
        // Decode the token
        let tokenData;
        try {
            const decoded = Buffer.from(token, 'base64').toString('utf-8');
            tokenData = JSON.parse(decoded);
        }
        catch (_a) {
            res.status(400).json({ error: 'Invalid download token' });
            return;
        }
        const { filePath, fileName, mimeType, timestamp } = tokenData;
        // Check if token is too old (1 hour expiry)
        if (Date.now() - timestamp > 60 * 60 * 1000) {
            res.status(410).json({ error: 'Download link has expired' });
            return;
        }
        // Get file from Firebase Storage
        const storage = (0, storage_1.getStorage)();
        const bucket = storage.bucket();
        const file = bucket.file(filePath);
        // Check if file exists
        const [exists] = await file.exists();
        if (!exists) {
            res.status(404).json({ error: 'File not found' });
            return;
        }
        // Set headers for download
        res.set({
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        // Stream the file
        const stream = file.createReadStream();
        stream.on('error', (error) => {
            console.error('File stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'File download failed' });
            }
        });
        stream.pipe(res);
    }
    catch (error) {
        console.error('Download failed:', error);
        if (!res.headersSent) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
});
//# sourceMappingURL=generateExport.js.map