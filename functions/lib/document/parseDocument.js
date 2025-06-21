"use strict";
/**
 * @fileoverview Document parsing Firebase Function
 * @module functions/document/parseDocument
 *
 * Dependencies: Firebase Functions, Mammoth, PDF Parse, Express, Busboy
 * Usage: Parses uploaded documents (.txt, .doc, .docx, .pdf) and extracts content
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDocument = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const busboy_1 = __importDefault(require("busboy"));
const mammoth_1 = __importDefault(require("mammoth"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
/**
 * Maximum file size: 5MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;
/**
 * Supported file types and their MIME types
 */
const SUPPORTED_TYPES = {
    'text/plain': 'txt',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/pdf': 'pdf'
};
/**
 * Parse text from uploaded file based on file type
 */
async function parseFileContent(buffer, mimeType) {
    const fileType = SUPPORTED_TYPES[mimeType];
    switch (fileType) {
        case 'txt':
            return buffer.toString('utf-8');
        case 'doc':
        case 'docx':
            try {
                const result = await mammoth_1.default.extractRawText({ buffer });
                return result.value;
            }
            catch (error) {
                firebase_functions_1.logger.error('Error parsing Word document:', error);
                throw new Error('Failed to parse Word document');
            }
        case 'pdf':
            try {
                const data = await (0, pdf_parse_1.default)(buffer);
                return data.text;
            }
            catch (error) {
                firebase_functions_1.logger.error('Error parsing PDF document:', error);
                throw new Error('Failed to parse PDF document');
            }
        default:
            throw new Error(`Unsupported file type: ${fileType}`);
    }
}
/**
 * Convert plain text to basic Tiptap content structure
 * Preserves line breaks and indentation for proper formatting
 */
function textToTiptapContent(text) {
    // Split text into individual lines to preserve line breaks and indentation
    const lines = text.split(/\r?\n/);
    if (lines.length === 0 || lines.every(line => line.trim().length === 0)) {
        return {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: []
                }
            ]
        };
    }
    // Convert each line to a paragraph, preserving whitespace
    const content = lines.map(line => {
        // Handle empty lines as empty paragraphs
        if (line.trim().length === 0) {
            return {
                type: 'paragraph',
                content: []
            };
        }
        // For non-empty lines, preserve leading whitespace by converting tabs/spaces to text
        // Replace tabs with appropriate spacing for better display
        const processedLine = line.replace(/^\t+/, (tabs) => {
            // Convert each tab to 4 spaces for consistent display
            return '    '.repeat(tabs.length);
        });
        return {
            type: 'paragraph',
            content: [
                {
                    type: 'text',
                    text: processedLine
                }
            ]
        };
    });
    return {
        type: 'doc',
        content
    };
}
/**
 * Express app for handling document parsing
 */
const app = (0, express_1.default)();
// Enable CORS with explicit configuration
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173', // Vite dev server
        'http://localhost:3000', // Alternative dev server
        'http://127.0.0.1:5173', // Alternative localhost
        /https:\/\/.*\.web\.app$/, // Firebase hosting preview
        /https:\/\/.*\.firebaseapp\.com$/ // Firebase hosting
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
}));
// Add request logging middleware
app.use((req, res, next) => {
    firebase_functions_1.logger.info(`${req.method} ${req.path} - Content-Type: ${req.get('Content-Type')}`);
    firebase_functions_1.logger.info(`Content-Length: ${req.get('Content-Length')}`);
    next();
});
/**
 * Parse document endpoint using Express raw body parser and busboy
 */
app.post('/parse', express_1.default.raw({
    type: 'multipart/form-data',
    limit: `${MAX_FILE_SIZE}b`
}), async (req, res) => {
    let responseHandled = false;
    const sendResponse = (statusCode, body) => {
        if (!responseHandled && !res.headersSent) {
            responseHandled = true;
            res.status(statusCode).json(body);
        }
    };
    const sendErrorResponse = (statusCode, error) => {
        sendResponse(statusCode, { success: false, error });
    };
    const sendSuccessResponse = (data) => {
        sendResponse(200, { success: true, data });
    };
    try {
        firebase_functions_1.logger.info('=== PARSE ENDPOINT ===');
        const contentType = req.get('Content-Type') || '';
        if (!contentType.includes('multipart/form-data')) {
            sendErrorResponse(400, 'Content-Type must be multipart/form-data');
            return;
        }
        if (!req.body || req.body.length === 0) {
            sendErrorResponse(400, 'No request body received');
            return;
        }
        firebase_functions_1.logger.info(`Processing request body: ${req.body.length} bytes`);
        // Parse with busboy using the raw body buffer
        let fileBuffer = null;
        let fileName = '';
        let fileMimeType = '';
        let hasFileError = false;
        const bb = (0, busboy_1.default)({
            headers: req.headers,
            limits: {
                fileSize: MAX_FILE_SIZE,
                files: 1,
                fields: 0
            }
        });
        // Handle file upload
        bb.on('file', (fieldname, file, info) => {
            const { filename, mimeType } = info;
            firebase_functions_1.logger.info(`Processing file: ${filename} (${mimeType})`);
            if (fieldname !== 'document') {
                firebase_functions_1.logger.error(`Unexpected field name: ${fieldname}, expected 'document'`);
                hasFileError = true;
                file.resume();
                sendErrorResponse(400, 'File field must be named "document"');
                return;
            }
            // Validate file type
            if (!SUPPORTED_TYPES[mimeType]) {
                firebase_functions_1.logger.error(`Unsupported file type: ${mimeType}`);
                hasFileError = true;
                file.resume();
                sendErrorResponse(400, `Unsupported file type: ${mimeType}. Supported formats: ${Object.values(SUPPORTED_TYPES).join(', ')}`);
                return;
            }
            fileName = filename;
            fileMimeType = mimeType;
            const fileChunks = [];
            file.on('data', (chunk) => {
                if (!hasFileError) {
                    fileChunks.push(chunk);
                }
            });
            file.on('end', () => {
                if (!hasFileError && fileChunks.length > 0) {
                    fileBuffer = Buffer.concat(fileChunks);
                    firebase_functions_1.logger.info(`File extracted: ${fileBuffer.length} bytes`);
                }
            });
            file.on('error', (error) => {
                firebase_functions_1.logger.error('File stream error:', error);
                hasFileError = true;
                sendErrorResponse(500, `File processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            });
        });
        // Handle busboy errors
        bb.on('error', (error) => {
            firebase_functions_1.logger.error('Busboy error:', error);
            hasFileError = true;
            sendErrorResponse(500, `Form parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        });
        // Handle completion
        bb.on('close', async () => {
            try {
                clearTimeout(timeout); // Clear the parsing timeout
                firebase_functions_1.logger.info('Busboy form parsing complete');
                if (hasFileError || responseHandled) {
                    firebase_functions_1.logger.info('Skipping processing due to previous error or response already sent');
                    return;
                }
                if (!fileBuffer) {
                    sendErrorResponse(400, 'No file found in request. Make sure to use "document" as the field name.');
                    return;
                }
                firebase_functions_1.logger.info(`Processing document: ${fileName} (${fileMimeType}, ${fileBuffer.length} bytes)`);
                // Parse the file content
                const plainText = await parseFileContent(fileBuffer, fileMimeType);
                if (!plainText.trim()) {
                    sendErrorResponse(400, 'Document appears to be empty or could not be parsed');
                    return;
                }
                // Convert to Tiptap content structure
                const content = textToTiptapContent(plainText);
                // Calculate word count
                const wordCount = plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
                // Generate a default title from filename
                const defaultTitle = fileName.replace(/\.[^/.]+$/, '');
                const result = {
                    title: defaultTitle,
                    content: content,
                    plainText: plainText.trim(),
                    wordCount,
                    characterCount: plainText.trim().length,
                    originalFileName: fileName,
                    fileSize: fileBuffer.length,
                    parsedAt: new Date().toISOString()
                };
                firebase_functions_1.logger.info(`Successfully parsed document: ${wordCount} words, ${plainText.length} characters`);
                sendSuccessResponse(result);
            }
            catch (error) {
                firebase_functions_1.logger.error('Error processing uploaded file:', error);
                sendErrorResponse(500, error instanceof Error ? error.message : 'Failed to process uploaded file');
            }
        });
        // Set up parsing timeout
        const timeout = setTimeout(() => {
            if (!responseHandled) {
                firebase_functions_1.logger.error('Parsing timeout');
                sendErrorResponse(408, 'Parsing timeout');
            }
        }, 30000); // 30 second timeout for parsing
        // Write the body buffer to busboy and end
        bb.write(req.body);
        bb.end();
    }
    catch (error) {
        firebase_functions_1.logger.error('Error in parse endpoint:', error);
        sendErrorResponse(500, error instanceof Error ? error.message : 'Failed to parse document');
    }
});
/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Document parser service is healthy',
        supportedTypes: Object.values(SUPPORTED_TYPES)
    });
});
/**
 * Test endpoint for debugging
 */
app.post('/test', (req, res) => {
    firebase_functions_1.logger.info('Test endpoint called');
    firebase_functions_1.logger.info(`Content-Type: ${req.get('Content-Type')}`);
    firebase_functions_1.logger.info(`Content-Length: ${req.get('Content-Length')}`);
    res.json({
        success: true,
        message: 'Test endpoint working',
        headers: req.headers,
        method: req.method
    });
});
/**
 * Firebase Function export
 */
exports.parseDocument = (0, https_1.onRequest)({
    timeoutSeconds: 60,
    memory: '512MiB'
}, app);
//# sourceMappingURL=parseDocument.js.map