# Project Rules - WordWise.ai

Comprehensive development standards and organizational guidelines for building an AI-first, modular, and scalable writing assistant codebase.

---

## Core Philosophy

### **AI-First Development Principles**
- **Modular Architecture**: Every component, hook, and utility should be self-contained and reusable
- **Maximum Readability**: Code should be immediately understandable by both humans and AI tools
- **Scalable Structure**: File organization should support growth without reorganization
- **Documentation-Driven**: Every file and function must be thoroughly documented
- **Consistency Above Brevity**: Explicit, descriptive code over clever shortcuts

---

## Directory Structure

### **Root Level Organization**
```
wordwise-ai/
├── src/                          # Application source code
├── public/                       # Static assets
├── docs/                         # Project documentation
├── tests/                        # Test files (mirrors src structure)
├── firebase/                     # Firebase configuration and rules
├── .github/                      # GitHub workflows and templates
└── [config files]               # Package.json, tailwind.config.js, etc.
```

### **Source Code Structure (`src/`)**
```
src/
├── components/                   # React components
│   ├── ui/                      # Shadcn/ui base components
│   ├── editor/                  # Tiptap editor components
│   ├── dashboard/               # Dashboard-specific components
│   ├── auth/                    # Authentication components
│   ├── suggestions/             # AI suggestion components
│   ├── layout/                  # Layout and navigation components
│   └── common/                  # Shared utility components
├── hooks/                       # Custom React hooks
│   ├── auth/                    # Authentication hooks
│   ├── editor/                  # Editor-related hooks
│   ├── ai/                      # AI integration hooks
│   ├── firebase/                # Firebase data hooks
│   └── ui/                      # UI state management hooks
├── lib/                         # Utility libraries and configurations
│   ├── firebase/                # Firebase setup and utilities
│   ├── ai/                      # OpenAI integration utilities
│   ├── editor/                  # Tiptap configuration and extensions
│   ├── utils/                   # General utility functions
│   └── constants/               # Application constants
├── types/                       # TypeScript type definitions
│   ├── auth.ts                  # Authentication types
│   ├── document.ts              # Document and content types
│   ├── ai.ts                    # AI suggestion types
│   ├── ui.ts                    # UI component types
│   └── index.ts                 # Re-exported types
├── services/                    # Business logic and API services
│   ├── auth/                    # Authentication services
│   ├── document/                # Document management services
│   ├── ai/                      # AI processing services
│   ├── storage/                 # File storage services
│   └── analytics/               # Usage analytics services
├── pages/                       # Route components (if using file-based routing)
│   ├── auth/                    # Authentication pages
│   ├── dashboard/               # Dashboard pages
│   ├── editor/                  # Editor pages
│   └── settings/                # Settings pages
├── styles/                      # Global styles and Tailwind customizations
│   ├── globals.css              # Global CSS imports
│   ├── components.css           # Component-specific styles
│   └── utilities.css            # Custom utility classes
└── app/                         # App configuration and providers
    ├── providers/               # Context providers
    ├── store/                   # State management (if needed)
    └── router/                  # Routing configuration
```

### **Firebase Structure (`firebase/`)**
```
firebase/
├── functions/                   # Cloud Functions
│   ├── src/
│   │   ├── ai/                 # AI processing functions
│   │   ├── document/           # Document processing functions
│   │   ├── auth/               # Authentication functions
│   │   └── utils/              # Shared utilities
│   └── package.json
├── firestore/                  # Firestore configuration
│   ├── rules/                  # Security rules
│   └── indexes/                # Database indexes
└── storage/                    # Storage configuration
    └── rules/                  # Storage security rules
```

### **Documentation Structure (`docs/`)**
```
docs/
├── api/                        # API documentation
├── components/                 # Component documentation
├── guides/                     # Development guides
├── architecture/               # Architecture decisions
└── deployment/                 # Deployment guides
```

---

## File Naming Conventions

### **Component Files**
```typescript
// ✅ Correct naming
DocumentEditor.tsx              // PascalCase for React components
SuggestionSidebar.tsx          // Descriptive, specific names
AuthLoginForm.tsx              // Prefix with feature area
UISeparator.tsx                // UI prefix for base components

// ❌ Incorrect naming
editor.tsx                     // Too generic
docEdit.tsx                    // Abbreviated
LoginForm.tsx                  // Missing context
```

### **Hook Files**
```typescript
// ✅ Correct naming
useDocumentAutoSave.ts         // Descriptive action
useAIAnalysis.ts               // Clear purpose
useAuthState.ts                // State management hooks
useEditorExtensions.ts         // Feature-specific

// ❌ Incorrect naming
useDoc.ts                      // Too abbreviated
useEditor.ts                   // Too generic
hooks.ts                       // Non-descriptive
```

### **Utility Files**
```typescript
// ✅ Correct naming
documentValidation.ts          // Specific functionality
aiPromptTemplates.ts          // Clear content
editorContentParser.ts        // Descriptive action
firebaseDocumentConverter.ts  // Integration utilities

// ❌ Incorrect naming
utils.ts                      // Too generic
helpers.ts                    // Non-specific
misc.ts                       // Meaningless
```

### **Type Definition Files**
```typescript
// ✅ Correct naming
document.types.ts             // Feature-specific types
ai.types.ts                   // AI-related types
auth.types.ts                 // Authentication types
ui.types.ts                   // UI component types

// ❌ Incorrect naming
types.ts                      // Too generic
interfaces.ts                 // Implementation detail
defs.ts                       // Abbreviated
```

### **Service Files**
```typescript
// ✅ Correct naming
documentService.ts            // Clear service purpose
aiAnalysisService.ts          // Specific functionality
authenticationService.ts      // Full descriptive name
storageService.ts             // Infrastructure service

// ❌ Incorrect naming
service.ts                    // Generic
api.ts                        // Too broad
data.ts                       // Unclear purpose
```

---

## Code Organization Standards

### **File Structure Requirements**

#### **Every File Must Include:**
1. **File Header Comment**: Purpose, dependencies, and usage
2. **Imports Section**: Grouped and organized
3. **Type Definitions**: Local types if not in separate file
4. **Main Implementation**: Core functionality
5. **Default Export**: Single primary export per file
6. **Named Exports**: Additional utilities if needed

### **File Header Template**
```typescript
/**
 * @fileoverview Brief description of file purpose and functionality
 * @module path/to/module
 * @author WordWise.ai Team
 * @created 2024-01-XX
 * 
 * Dependencies:
 * - List key dependencies
 * - External libraries used
 * - Internal modules imported
 * 
 * Usage:
 * - Primary use cases
 * - Integration points
 * - Important considerations
 */
```

### **Import Organization**
```typescript
// 1. External library imports
import React, { useState, useEffect } from 'react';
import { useEditor } from '@tiptap/react';
import { collection, doc, onSnapshot } from 'firebase/firestore';

// 2. Internal component imports
import { Button } from '@/components/ui/Button';
import { DocumentEditor } from '@/components/editor/DocumentEditor';

// 3. Hook imports
import { useAuthState } from '@/hooks/auth/useAuthState';
import { useDocumentAutoSave } from '@/hooks/editor/useDocumentAutoSave';

// 4. Utility and service imports
import { documentService } from '@/services/document/documentService';
import { validateDocumentContent } from '@/lib/utils/documentValidation';

// 5. Type imports (separated and grouped)
import type { Document, DocumentVersion } from '@/types/document';
import type { User } from '@/types/auth';
import type { AIAnalysis } from '@/types/ai';
```

### **Function Documentation Standards**

#### **JSDoc Format for All Functions**
```typescript
/**
 * Analyzes document content for grammar, style, and readability suggestions
 * 
 * @param content - Raw text content to analyze
 * @param options - Analysis configuration options
 * @param options.includeGrammar - Whether to include grammar analysis
 * @param options.includeStyle - Whether to include style suggestions
 * @param options.includeReadability - Whether to include readability metrics
 * @param userId - User ID for personalized suggestions
 * @returns Promise resolving to comprehensive analysis results
 * 
 * @throws {AIAnalysisError} When OpenAI API fails or rate limit exceeded
 * @throws {ValidationError} When content format is invalid
 * 
 * @example
 * ```typescript
 * const analysis = await analyzeDocumentContent(
 *   "The quick brown fox jumps over the lazy dog.",
 *   { includeGrammar: true, includeStyle: true, includeReadability: false },
 *   "user123"
 * );
 * ```
 */
async function analyzeDocumentContent(
  content: string,
  options: AnalysisOptions,
  userId: string
): Promise<AIAnalysisResult> {
  // Implementation
}
```

#### **Component Documentation**
```typescript
/**
 * DocumentEditor - Rich text editor component with real-time AI suggestions
 * 
 * Integrates Tiptap editor with AI-powered writing assistance, providing:
 * - Real-time grammar and style suggestions
 * - Inline suggestion highlighting
 * - Auto-save functionality
 * - Version history tracking
 * 
 * @param props - Component props
 * @param props.documentId - Unique document identifier
 * @param props.initialContent - Initial document content
 * @param props.onContentChange - Callback for content changes
 * @param props.readOnly - Whether editor is in read-only mode
 * @param props.className - Additional CSS classes
 * 
 * @example
 * ```tsx
 * <DocumentEditor
 *   documentId="doc123"
 *   initialContent="Hello world..."
 *   onContentChange={(content) => console.log(content)}
 *   readOnly={false}
 * />
 * ```
 */
interface DocumentEditorProps {
  documentId: string;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  readOnly?: boolean;
  className?: string;
}

export function DocumentEditor(props: DocumentEditorProps): JSX.Element {
  // Implementation
}
```

---

## Code Quality Standards

### **TypeScript Requirements**
- **Strict Mode**: All files must pass TypeScript strict mode
- **Explicit Types**: No `any` types except in exceptional circumstances
- **Interface Definitions**: All component props must have explicit interfaces
- **Enum Alternatives**: Use const assertions or maps instead of enums
- **Generic Constraints**: Use proper generic constraints for reusable functions

### **React Component Standards**
```typescript
// ✅ Correct component structure
/**
 * @fileoverview Suggestion sidebar component for AI writing assistance
 */

import React, { memo, useCallback } from 'react';
import type { FC } from 'react';

interface SuggestionSidebarProps {
  suggestions: AISuggestion[];
  onApplySuggestion: (suggestionId: string) => void;
  onDismissSuggestion: (suggestionId: string) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Displays AI suggestions in categorized sections with apply/dismiss actions
 */
export const SuggestionSidebar: FC<SuggestionSidebarProps> = memo(({
  suggestions,
  onApplySuggestion,
  onDismissSuggestion,
  isLoading = false,
  className
}) => {
  // Implementation with proper hooks usage
  const handleApplyAll = useCallback((category: SuggestionCategory) => {
    // Implementation
  }, []);

  return (
    // JSX implementation
  );
});

SuggestionSidebar.displayName = 'SuggestionSidebar';
```

### **Custom Hook Standards**
```typescript
// ✅ Correct hook structure
/**
 * @fileoverview Custom hook for managing document auto-save functionality
 */

import { useEffect, useRef, useCallback } from 'react';
import type { Document } from '@/types/document';

interface UseDocumentAutoSaveOptions {
  interval?: number;
  debounceDelay?: number;
  onSaveSuccess?: (document: Document) => void;
  onSaveError?: (error: Error) => void;
}

/**
 * Manages automatic document saving with debouncing and error handling
 * 
 * @param documentId - Document identifier
 * @param content - Current document content
 * @param options - Configuration options
 * @returns Object containing save status and manual save function
 */
export function useDocumentAutoSave(
  documentId: string,
  content: string,
  options: UseDocumentAutoSaveOptions = {}
) {
  // Hook implementation with proper cleanup
  
  return {
    isSaving,
    lastSaved,
    saveNow: handleManualSave,
    saveError
  };
}
```

---

## AI Tool Compatibility Requirements

### **File Size Limitations**
- **Maximum 500 lines per file**: Split larger files into logical modules
- **Single Responsibility**: Each file should have one primary purpose
- **Clear Boundaries**: Avoid mixing unrelated functionality in single files

### **Documentation for AI Understanding**
```typescript
// ✅ AI-friendly documentation
/**
 * CONTEXT: This service handles all document-related Firebase operations
 * DEPENDENCIES: Requires Firebase Auth and Firestore
 * INTEGRATION: Used by document hooks and editor components
 * 
 * KEY FUNCTIONALITY:
 * - CRUD operations for documents
 * - Version history management
 * - Real-time document synchronization
 * - Collaborative editing support (future)
 */

// ✅ Explicit function purposes
/**
 * Creates a new document version and saves to Firestore
 * TRIGGER: Called when user content changes after 2-second delay
 * SIDE EFFECTS: Updates document metadata, creates version history entry
 */
export async function createDocumentVersion(/* params */) {
  // Implementation
}
```

### **Code Readability Standards**
```typescript
// ✅ Descriptive variable names
const documentAutoSaveInterval = 5000;
const suggestionAnalysisDelay = 2000;
const maxDocumentVersionHistory = 50;

// ✅ Clear function names
function parseDocumentContentForAIAnalysis() { }
function convertFirestoreDocumentToAppFormat() { }
function validateUserInputBeforeSaving() { }

// ❌ Avoid abbreviations and unclear names
const docSaveInt = 5000;
const sugDelay = 2000;
function parseDoc() { }
function convertFS() { }
```

---

## Testing Standards

### **Test File Organization**
```
tests/
├── __mocks__/                  # Mock implementations
├── components/                 # Component tests (mirrors src/components)
├── hooks/                      # Hook tests (mirrors src/hooks)
├── services/                   # Service tests (mirrors src/services)
├── utils/                      # Utility tests
└── integration/                # Integration and E2E tests
```

### **Test File Naming**
```typescript
// ✅ Correct test naming
DocumentEditor.test.tsx         // Component tests
useDocumentAutoSave.test.ts     // Hook tests
documentService.test.ts         // Service tests
aiAnalysisIntegration.test.ts   // Integration tests

// ❌ Incorrect test naming
editor.spec.ts                  // Non-descriptive
tests.ts                        // Too generic
```

### **Test Documentation**
```typescript
/**
 * @fileoverview Test suite for DocumentEditor component
 * 
 * Tests cover:
 * - Basic rendering and props handling
 * - AI suggestion integration
 * - Auto-save functionality
 * - Keyboard shortcuts and accessibility
 */

describe('DocumentEditor', () => {
  /**
   * Tests that component renders with initial content
   * and applies proper CSS classes
   */
  test('renders with initial content and styling', () => {
    // Test implementation
  });
});
```

---

## Performance Standards

### **Bundle Size Optimization**
- **Code Splitting**: Split components and routes appropriately
- **Lazy Loading**: Implement lazy loading for non-critical components
- **Tree Shaking**: Ensure all imports support tree shaking
- **Dynamic Imports**: Use dynamic imports for large dependencies

### **Memory Management**
```typescript
// ✅ Proper cleanup in hooks
export function useRealtimeDocument(documentId: string) {
  useEffect(() => {
    const unsubscribe = onSnapshot(/* ... */);
    
    // Always clean up subscriptions
    return () => {
      unsubscribe();
    };
  }, [documentId]);
}

// ✅ Memoization for expensive operations
const expensiveCalculation = useMemo(() => {
  return computeReadabilityMetrics(content);
}, [content]);
```

---

## Security Standards

### **Data Handling**
- **Input Validation**: All user inputs must be validated before processing
- **Sanitization**: Sanitize content before saving or displaying
- **API Key Protection**: Never expose API keys in client-side code
- **Firebase Rules**: Implement restrictive security rules from the start

### **Error Handling**
```typescript
// ✅ Comprehensive error handling
/**
 * Handles AI analysis with comprehensive error handling and user feedback
 */
export async function analyzeDocumentSafely(content: string): Promise<AIAnalysisResult> {
  try {
    const result = await aiService.analyzeContent(content);
    return result;
  } catch (error) {
    if (error instanceof RateLimitError) {
      // Handle rate limiting gracefully
      throw new UserFriendlyError('Analysis temporarily unavailable. Please try again in a moment.');
    } else if (error instanceof NetworkError) {
      // Handle network issues
      throw new UserFriendlyError('Connection issue. Please check your internet and try again.');
    } else {
      // Log unexpected errors for debugging
      console.error('Unexpected AI analysis error:', error);
      throw new UserFriendlyError('Analysis failed. Please try again.');
    }
  }
}
```

---

## Deployment Standards

### **Environment Configuration**
- **Environment Variables**: Use environment variables for all configuration
- **Build Optimization**: Optimize builds for production deployment
- **Error Monitoring**: Implement comprehensive error tracking
- **Performance Monitoring**: Track key performance metrics

### **Documentation Requirements**
- **README Files**: Each major directory should have a README explaining its purpose
- **API Documentation**: All public functions should have comprehensive documentation
- **Architecture Decisions**: Document major architectural choices and trade-offs
- **Deployment Guides**: Step-by-step deployment instructions

---

This comprehensive project rules document ensures consistent, maintainable, and AI-friendly code development for WordWise.ai. All team members must follow these standards to maintain code quality and project scalability. 
