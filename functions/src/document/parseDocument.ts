/**
 * @fileoverview Document parsing Firebase Function
 * @module functions/document/parseDocument
 * 
 * Dependencies: Firebase Functions, Mammoth, PDF Parse, Express, Busboy
 * Usage: Parses uploaded documents (.txt, .doc, .docx, .pdf) and extracts content
 */

import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import busboy from 'busboy';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import type { TiptapContent } from '../types/document';

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
async function parseFileContent(buffer: Buffer, mimeType: string): Promise<string> {
  const fileType = SUPPORTED_TYPES[mimeType as keyof typeof SUPPORTED_TYPES];
  
  switch (fileType) {
    case 'txt':
      return buffer.toString('utf-8');
      
    case 'doc':
    case 'docx':
      try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      } catch (error) {
        logger.error('Error parsing Word document:', error);
        throw new Error('Failed to parse Word document');
      }
      
    case 'pdf':
      try {
        const data = await pdfParse(buffer);
        return data.text;
      } catch (error) {
        logger.error('Error parsing PDF document:', error);
        throw new Error('Failed to parse PDF document');
      }
      
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/**
 * Convert plain text to basic Tiptap content structure
 */
function textToTiptapContent(text: string): TiptapContent {
  // Split text into paragraphs and create Tiptap content
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  if (paragraphs.length === 0) {
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
  
  return {
    type: 'doc',
    content: paragraphs.map(paragraph => ({
      type: 'paragraph',
      content: paragraph.trim() ? [
        {
          type: 'text',
          text: paragraph.trim()
        }
      ] : []
    }))
  };
}

/**
 * Express app for handling document parsing
 */
const app = express();

// Enable CORS with explicit configuration
app.use(cors({
  origin: [
    'http://localhost:5173',      // Vite dev server
    'http://localhost:3000',      // Alternative dev server
    'http://127.0.0.1:5173',      // Alternative localhost
    /https:\/\/.*\.web\.app$/,     // Firebase hosting preview
    /https:\/\/.*\.firebaseapp\.com$/ // Firebase hosting
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Add request logging middleware
app.use((req, res, next): void => {
  logger.info(`${req.method} ${req.path} - Content-Type: ${req.get('Content-Type')}`);
  logger.info(`Content-Length: ${req.get('Content-Length')}`);
  next();
});

/**
 * Parse document endpoint using Express raw body parser and busboy
 */
app.post('/parse', 
  express.raw({ 
    type: 'multipart/form-data', 
    limit: `${MAX_FILE_SIZE}b`
  }), 
  async (req, res): Promise<void> => {
    let responseHandled = false;
    
    const sendResponse = (statusCode: number, body: Record<string, unknown>) => {
      if (!responseHandled && !res.headersSent) {
        responseHandled = true;
        res.status(statusCode).json(body);
      }
    };
    
    const sendErrorResponse = (statusCode: number, error: string) => {
      sendResponse(statusCode, { success: false, error });
    };
    
    const sendSuccessResponse = (data: Record<string, unknown>) => {
      sendResponse(200, { success: true, data });
    };
    
    try {
      logger.info('=== PARSE ENDPOINT ===');
      
      const contentType = req.get('Content-Type') || '';
      
      if (!contentType.includes('multipart/form-data')) {
        sendErrorResponse(400, 'Content-Type must be multipart/form-data');
        return;
      }

      if (!req.body || req.body.length === 0) {
        sendErrorResponse(400, 'No request body received');
        return;
      }

      logger.info(`Processing request body: ${req.body.length} bytes`);

      // Parse with busboy using the raw body buffer
      let fileBuffer: Buffer | null = null;
      let fileName = '';
      let fileMimeType = '';
      let hasFileError = false;

      const bb = busboy({
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
        
        logger.info(`Processing file: ${filename} (${mimeType})`);
        
        if (fieldname !== 'document') {
          logger.error(`Unexpected field name: ${fieldname}, expected 'document'`);
          hasFileError = true;
          file.resume();
          sendErrorResponse(400, 'File field must be named "document"');
          return;
        }

        // Validate file type
        if (!SUPPORTED_TYPES[mimeType as keyof typeof SUPPORTED_TYPES]) {
          logger.error(`Unsupported file type: ${mimeType}`);
          hasFileError = true;
          file.resume();
          sendErrorResponse(400, `Unsupported file type: ${mimeType}. Supported formats: ${Object.values(SUPPORTED_TYPES).join(', ')}`);
          return;
        }

        fileName = filename;
        fileMimeType = mimeType;
        
        const fileChunks: Buffer[] = [];
        
        file.on('data', (chunk: Buffer) => {
          if (!hasFileError) {
            fileChunks.push(chunk);
          }
        });
        
        file.on('end', () => {
          if (!hasFileError && fileChunks.length > 0) {
            fileBuffer = Buffer.concat(fileChunks);
            logger.info(`File extracted: ${fileBuffer.length} bytes`);
          }
        });

        file.on('error', (error) => {
          logger.error('File stream error:', error);
          hasFileError = true;
          sendErrorResponse(500, `File processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        });
      });

      // Handle busboy errors
      bb.on('error', (error) => {
        logger.error('Busboy error:', error);
        hasFileError = true;
        sendErrorResponse(500, `Form parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });

      // Handle completion
      bb.on('close', async () => {
        try {
          clearTimeout(timeout); // Clear the parsing timeout
          logger.info('Busboy form parsing complete');
          
          if (hasFileError || responseHandled) {
            logger.info('Skipping processing due to previous error or response already sent');
            return;
          }
          
          if (!fileBuffer) {
            sendErrorResponse(400, 'No file found in request. Make sure to use "document" as the field name.');
            return;
          }

          logger.info(`Processing document: ${fileName} (${fileMimeType}, ${fileBuffer.length} bytes)`);
          
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
          
          logger.info(`Successfully parsed document: ${wordCount} words, ${plainText.length} characters`);
          
          sendSuccessResponse(result);
          
        } catch (error) {
          logger.error('Error processing uploaded file:', error);
          sendErrorResponse(500, error instanceof Error ? error.message : 'Failed to process uploaded file');
        }
      });

      // Set up parsing timeout
      const timeout = setTimeout(() => {
        if (!responseHandled) {
          logger.error('Parsing timeout');
          sendErrorResponse(408, 'Parsing timeout');
        }
      }, 30000); // 30 second timeout for parsing

      // Write the body buffer to busboy and end
      bb.write(req.body);
      bb.end();
      
    } catch (error) {
      logger.error('Error in parse endpoint:', error);
      sendErrorResponse(500, error instanceof Error ? error.message : 'Failed to parse document');
    }
  }
);

/**
 * Health check endpoint
 */
app.get('/health', (req, res): void => {
  res.json({ 
    success: true, 
    message: 'Document parser service is healthy',
    supportedTypes: Object.values(SUPPORTED_TYPES)
  });
});

/**
 * Test endpoint for debugging
 */
app.post('/test', (req, res): void => {
  logger.info('Test endpoint called');
  logger.info(`Content-Type: ${req.get('Content-Type')}`);
  logger.info(`Content-Length: ${req.get('Content-Length')}`);
  
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
export const parseDocument = onRequest({
  timeoutSeconds: 60,
  memory: '512MiB'
}, app); 
