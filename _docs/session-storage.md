# Session Storage - Active Document Management

## Overview

The WordWise.ai application uses session storage to track the currently active document across the user's browser session. This provides a consistent experience when navigating between documents and ensures the application remembers which document the user was last working on.

---

## How It Works

### **Automatic Setting**
The active document is automatically set in session storage when:

1. **Creating a new document** - When a user creates a new document from the Documents page
2. **Clicking a document card** - When a user clicks on any document card in the document list
3. **Direct navigation** - When a user navigates directly to an editor URL (e.g., `/editor/doc123`)

### **Session Persistence**
- The active document persists throughout the browser session
- Refreshing the page or navigating within the app maintains the active document
- The active document is cleared when the session ends (browser/tab closed)

---

## Implementation

### **Core Utilities**
Located in `src/lib/utils/sessionStorage.ts`:

```typescript
// Set active document
setActiveDocument(documentId: string): void

// Get current active document  
getActiveDocument(): string | null

// Clear active document
clearActiveDocument(): void

// Check if document is active
isActiveDocument(documentId: string): boolean
```

### **React Hook**
Located in `src/hooks/document/useActiveDocument.ts`:

```typescript
const {
  activeDocumentId,      // Current active document ID
  setActiveDocument,     // Set document as active
  clearActiveDocument,   // Clear active document
  isActiveDocument,      // Check if document is active
  hasActiveDocument,     // Boolean - has active document
} = useActiveDocument();
```

### **Integration Points**

#### **Document Creation**
```typescript
// src/pages/DocumentsPage.tsx
const handleCreateDocument = async () => {
  const documentId = await createNewDocument();
  if (documentId) {
    setActiveDocument(documentId); // ✅ Set as active
    navigate(`/editor/${documentId}`);
  }
};
```

#### **Document Navigation**
```typescript
// src/components/dashboard/DocumentCard.tsx
const handleOpenDocument = () => {
  setActiveDocument(document.id); // ✅ Set as active
  navigate(`/editor/${document.id}`);
};
```

#### **Editor Loading**
```typescript
// src/pages/EditorPage.tsx
useEffect(() => {
  if (documentId) {
    setActiveDocument(documentId); // ✅ Set as active
  }
}, [documentId]);
```

#### **Navigation Sidebar**
```typescript
// src/components/layout/NavigationSidebar.tsx
const { activeDocumentId, hasActiveDocument } = useActiveDocument();

const navigationItems: NavigationItem[] = [
  // ... other items
  {
    label: 'Editor',
    path: activeDocumentId ? `/editor/${activeDocumentId}` : '/editor',
    icon: Edit3,
    isActive: location.pathname.startsWith('/editor'),
    disabled: !hasActiveDocument // ✅ Disabled when no active document
  }
];
```

---

## Visual Indicators

### **Document Cards**
Active documents are visually distinguished in the document list:
- **Ring border** - Blue ring around the card
- **"Active" label** - Text indicator for active document
- **Enhanced styling** - Slightly different visual treatment

### **Navigation Sidebar**
The editor navigation item provides clear state indication:
- **Enabled state** - When active document exists, shows normal styling
- **Disabled state** - When no active document, grayed out with tooltip
- **Active state** - Highlighted when currently on editor page
- **Smart navigation** - Clicking opens the currently active document

```typescript
// Visual indicator implementation
const isCurrentlyActive = isActiveDocument(document.id);

return (
  <Card className={`... ${isCurrentlyActive ? 'ring-2 ring-primary' : ''}`}>
    {isCurrentlyActive && (
      <Circle className="h-3 w-3 fill-primary text-primary" />
    )}
  </Card>
);
```

---

## Cross-Tab Synchronization

The implementation includes cross-tab synchronization to ensure consistency:

### **Custom Events**
When the active document changes, a custom event is dispatched:
```typescript
window.dispatchEvent(new CustomEvent('active-document-changed', {
  detail: { documentId }
}));
```

### **Event Listeners**
The React hook listens for these events to keep state synchronized:
```typescript
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'wordwise_active_document_id') {
      setActiveDocumentId(e.newValue);
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('active-document-changed', handleCustomChange);
  
  return () => {
    // Cleanup listeners
  };
}, []);
```

---

## Usage Examples

### **Basic Usage**
```typescript
import { setActiveDocument, getActiveDocument } from '@/lib/utils';

// Set active document
setActiveDocument('doc-123');

// Get current active document
const activeId = getActiveDocument(); // Returns 'doc-123' or null
```

### **React Hook Usage**
```typescript
import { useActiveDocument } from '@/hooks/document';

function MyComponent() {
  const { activeDocumentId, setActiveDocument, hasActiveDocument } = useActiveDocument();
  
  return (
    <div>
      {hasActiveDocument ? (
        <p>Active: {activeDocumentId}</p>
      ) : (
        <p>No active document</p>
      )}
    </div>
  );
}
```

### **Conditional Rendering**
```typescript
import { useActiveDocument } from '@/hooks/document';

function DocumentActionButton({ documentId }: { documentId: string }) {
  const { isActiveDocument } = useActiveDocument();
  
  return (
    <Button variant={isActiveDocument(documentId) ? 'default' : 'outline'}>
      {isActiveDocument(documentId) ? 'Currently Active' : 'Open Document'}
    </Button>
  );
}
```

---

## Benefits

### **User Experience**
- **Consistent navigation** - Users always know which document is active
- **Visual feedback** - Clear indication of the current document
- **Session continuity** - Active document persists across page refreshes

### **Developer Experience**
- **Simple API** - Easy-to-use utilities and hooks
- **Type safety** - Full TypeScript support
- **Reactive** - Automatic updates when active document changes
- **Cross-tab sync** - Consistent state across browser tabs

### **Performance**
- **Session storage** - Fast, browser-native storage
- **Minimal overhead** - Lightweight implementation
- **Event-driven** - Efficient cross-component communication

---

## Future Enhancements

Potential improvements for the active document system:

1. **Persistence options** - Option to persist active document beyond session
2. **Multiple active documents** - Support for multiple active documents (tabs)
3. **Active document history** - Track recently active documents
4. **Auto-restore** - Automatically restore last active document on app startup
5. **Collaborative indicators** - Show when others are viewing the same document

---

## Technical Notes

### **Storage Key**
The session storage key is: `wordwise_active_document_id`

### **Event Names**
Custom event: `active-document-changed`

### **Error Handling**
All session storage operations include try-catch blocks to handle:
- Storage quota exceeded
- Private browsing restrictions
- Storage API unavailability

### **Browser Compatibility**
Session storage is supported in all modern browsers. The implementation gracefully degrades if session storage is unavailable. 
