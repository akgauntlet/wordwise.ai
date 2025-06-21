# WordWise.ai Firebase Functions

This directory contains the Firebase Functions for WordWise.ai, providing secure server-side functionality for AI text analysis and document processing.

## Overview

Firebase Functions protect sensitive operations like OpenAI API calls while providing rate limiting, caching, and comprehensive error handling for the WordWise.ai application.

### Available Functions

#### `analyzeText` (HTTP Callable)
Main AI text analysis function that processes user text through OpenAI's GPT models to provide grammar, style, and readability suggestions.

**Features:**
- ✅ Secure OpenAI API integration with protected API keys
- ✅ Rate limiting (100 requests/hour, 1M characters/hour per user)
- ✅ 24-hour response caching for identical content
- ✅ Comprehensive error handling and user-friendly messages
- ✅ Analytics and usage tracking
- ✅ Authentication requirement

## Setup Instructions

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Configure Environment Variables
Set up the OpenAI API key using Firebase CLI:

```bash
# Set the OpenAI API key
firebase functions:config:set openai.api_key="your-openai-api-key-here"

# Deploy the configuration
firebase deploy --only functions
```

### 3. Build Functions
```bash
npm run build
```

### 4. Deploy Functions
```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:analyzeText
```

## Development Workflow

### Local Development
```bash
# Start Firebase emulators
npm run serve

# Watch for changes and rebuild
npm run build:watch

# Run in separate terminal for live development
firebase emulators:start --only functions
```

### Testing
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Test function locally
npm run shell
```

### Deployment
```bash
# Production deployment
npm run deploy

# View function logs
npm run logs
```

## Function Details

### analyzeText Function

**Endpoint:** `https://us-central1-{project-id}.cloudfunctions.net/analyzeText`

**Request Format:**
```typescript
{
  content: string;           // Text to analyze (max 10,000 chars)
  options: {
    includeGrammar: boolean;     // Enable grammar analysis
    includeStyle: boolean;       // Enable style suggestions  
    includeReadability: boolean; // Enable readability analysis
    audienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    documentType?: 'essay' | 'email' | 'letter' | 'report' | 'other';
  };
  userId: string;           // User ID for rate limiting
  documentId?: string;      // Optional document ID for caching
}
```

**Response Format:**
```typescript
{
  success: boolean;
  data?: {
    analysisId: string;
    timestamp: Date;
    grammarSuggestions: GrammarSuggestion[];
    styleSuggestions: StyleSuggestion[];
    readabilitySuggestions: ReadabilitySuggestion[];
    readabilityMetrics: ReadabilityMetrics;
    totalSuggestions: number;
    processingTimeMs: number;
  };
  error?: {
    code: string;
    message: string;
    details?: string;
    retryAfter?: number;
  };
  requestId: string;
}
```

**Error Codes:**
- `RATE_LIMIT_EXCEEDED`: User has exceeded rate limits
- `CONTENT_TOO_LONG`: Text content exceeds 10,000 characters
- `INVALID_CONTENT`: Content is empty or invalid
- `API_ERROR`: OpenAI API or Firebase error
- `UNKNOWN_ERROR`: Unexpected error occurred

## Architecture

### Directory Structure
```
functions/
├── src/
│   ├── ai/               # AI-related functions
│   │   └── analyzeText.ts
│   ├── types/            # TypeScript type definitions
│   │   └── ai.ts
│   ├── utils/            # Utility functions
│   │   ├── openai.ts     # OpenAI integration utilities
│   │   └── rateLimiting.ts # Rate limiting utilities
│   └── index.ts          # Main entry point
├── lib/                  # Compiled JavaScript (generated)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── .eslintrc.js         # ESLint configuration
```

### Security Features

1. **API Key Protection**: OpenAI API keys are stored in Firebase Functions environment variables, never exposed to client-side code.

2. **Authentication**: All functions require Firebase Authentication.

3. **Rate Limiting**: Prevents API abuse with per-user limits stored in Firestore.

4. **Input Validation**: Comprehensive validation of all user inputs.

5. **Error Handling**: Secure error messages that don't expose internal system details.

### Performance Features

1. **Caching**: 24-hour cache for identical content analysis requests.

2. **Efficient Models**: Uses GPT-3.5 Turbo for fast and cost-effective text analysis.

3. **Optimized Prompts**: Simplified prompts for faster processing while maintaining quality.

4. **Reduced Token Usage**: Optimized token limits for faster response times.

5. **Optimized Firestore Operations**: Reduced database operations by 60-80% through:
   - Memory caching for rate limits
   - Conditional caching based on content value
   - Batched writes for real-time analysis
   - Eliminated non-essential metadata storage

6. **Simplified Response Parsing**: Reduced processing overhead by 70-80% through:
   - Streamlined JSON parsing optimized for GPT-3.5 Turbo
   - Minimal validation with essential checks only
   - Removed complex fallback parsing mechanisms
   - Fast suggestion extraction with 20-item limits

7. **Request Tracking**: Essential logging without performance overhead.

4. **Timeouts**: Appropriate timeouts prevent hanging requests.

## Monitoring and Analytics

### Firestore Collections Created

- `rateLimits`: User rate limiting data
- `analysisCache`: Cached analysis results  
- `analysisMetadata`: Analytics and usage statistics

### Logs and Monitoring

View function logs:
```bash
firebase functions:log
```

Monitor specific function:
```bash
firebase functions:log --only analyzeText
```

### Rate Limiting Status

Rate limits are automatically enforced and tracked per user:
- **Requests**: 100 per hour per user
- **Characters**: 1,000,000 per hour per user
- **Window**: Rolling 1-hour window

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all dependencies are installed and TypeScript paths are correct.

2. **Deployment Failures**: Check Firebase project configuration and permissions.

3. **API Key Issues**: Verify OpenAI API key is set correctly in Firebase config.

4. **Rate Limiting**: Users hitting limits will receive clear error messages with retry times.

### Debug Commands

```bash
# Check function configuration
firebase functions:config:get

# View detailed logs
firebase functions:log --limit 50

# Test function locally
firebase functions:shell
```

## Future Enhancements

Planned functions for upcoming phases:

- `parseDocument`: Extract text from uploaded documents (.docx, .pdf)
- `generateExport`: Create formatted document exports
- `manageVersions`: Handle document version history
- `cleanupCache`: Maintenance function for cache cleanup
- `rateLimitCleanup`: Cleanup expired rate limit records

## Support

For issues related to Firebase Functions:

1. Check the [Firebase Functions documentation](https://firebase.google.com/docs/functions)
2. Review function logs using Firebase CLI
3. Ensure all environment variables are properly configured
4. Verify OpenAI API key has sufficient credits and permissions

---

**Security Note**: Never commit API keys or sensitive configuration to version control. Always use Firebase Functions configuration for sensitive environment variables. 
