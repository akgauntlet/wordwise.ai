# UI Rules - WordWise.ai

Comprehensive UI design principles and guidelines for building a consistent, accessible, and educational writing assistant interface.

---

## Core Design Principles

### 1. **Minimalist Content-First Design**
- **Principle**: Remove visual distractions to maintain writing flow
- **Implementation**: Clean editor interface with subtle UI elements that don't compete with text
- **Rationale**: ESL students need to focus on content without cognitive overload from busy interfaces

### 2. **Progressive Disclosure**
- **Principle**: Show information when needed, hide complexity until required
- **Implementation**: 
  - Collapsible sidebar with expandable sections
  - Contextual suggestion details on hover/click
  - Advanced features accessible but not prominent
- **Rationale**: Prevents overwhelming users while keeping powerful features accessible

### 3. **Clear Information Hierarchy**
- **Principle**: Visual hierarchy guides attention to most important elements
- **Implementation**:
  - Different colored underlines for suggestion types (red/green/blue)
  - Clear typography scale with consistent heading sizes
  - Prominent call-to-action buttons for primary actions
- **Rationale**: ESL learners need clear visual cues to understand suggestion priorities

### 4. **Educational Design Patterns**
- **Principle**: UI should teach while users interact
- **Implementation**:
  - Explanatory tooltips with grammar rules and style tips
  - Progress indicators showing writing improvement
  - Contextual help that doesn't interrupt workflow
- **Rationale**: Users are learning English - the interface should support their education

### 5. **Accessibility-First Approach**
- **Principle**: Design for screen readers, keyboard navigation, and color blindness
- **Implementation**:
  - High contrast ratios (4.5:1 minimum)
  - Keyboard shortcuts for all major actions
  - Alternative indicators beyond color for suggestion types
- **Rationale**: ESL students may use assistive technologies or have varying visual abilities

### 6. **Consistent Interaction Patterns**
- **Principle**: Similar actions should work the same way throughout the app
- **Implementation**:
  - Uniform button styles across all components
  - Consistent suggestion interaction (click to view, accept/reject)
  - Predictable navigation patterns
- **Rationale**: Reduces cognitive load for users learning both English and the interface

---

## Component Design Guidelines

### **Document Editor**
#### Layout Rules
- **Maximum Width**: 800px for optimal reading experience
- **Margins**: Minimum 24px on mobile, 48px on desktop
- **Line Height**: 1.7 for comfortable reading
- **Paragraph Spacing**: 1.5em between paragraphs

#### Visual Treatment
- **Background**: Paper-like appearance with subtle drop shadow
- **Border**: 1px solid border with rounded corners (8px radius)
- **Focus State**: Subtle blue outline without interfering with text selection
- **Cursor**: Standard text cursor with high visibility

#### Suggestion Integration
- **Inline Suggestions**: Wavy underlines that don't interfere with text flow
- **Hover States**: Smooth transition to show suggestion preview
- **Selection**: Maintain browser default selection styling
- **Performance**: Debounce suggestion rendering to avoid flicker

### **Suggestion Sidebar**
#### Structure
- **Width**: 320px on desktop, collapsible to 60px icon bar
- **Sections**: Clear dividers between Grammar, Style, and Readability
- **Cards**: Expandable suggestion cards with consistent spacing
- **Scroll**: Independent scroll area with custom scrollbar styling

#### Interaction Patterns
- **Expandable Content**: Smooth animations for opening/closing details
- **Bulk Actions**: "Apply All" buttons with clear visual hierarchy
- **Progress Indicators**: Visual feedback showing suggestion application
- **Empty States**: Encouraging messages when no suggestions exist

### **Dashboard Interface**
#### Document Management
- **Grid Layout**: Responsive grid with consistent card sizing
- **Document Cards**: Clean preview with metadata overlay
- **Actions**: Contextual actions on hover/focus
- **Search/Filter**: Prominent but not overwhelming placement

#### Version History
- **Timeline Layout**: Vertical timeline with clear timestamps
- **Comparison View**: Side-by-side diff highlighting
- **Restoration**: Clear confirmation dialogs for version changes
- **Navigation**: Easy return to current version

### **Authentication Pages**
#### Trust & Professionalism
- **Layout**: Centered, single-column design
- **Branding**: Consistent logo placement and sizing
- **Form Design**: Clean, well-spaced form fields
- **Social Login**: Prominent Google/email options

#### User Guidance
- **Value Proposition**: Clear benefits for ESL students
- **Error Handling**: Helpful, educational error messages
- **Loading States**: Reassuring feedback during authentication
- **Security**: Visual indicators of secure connection

---

## Responsive Design Rules

### **Mobile (320px - 768px)**
#### Layout Adaptations
- **Sidebar**: Transforms to bottom sheet or full-screen overlay
- **Editor**: Full-width with minimum 16px margins
- **Suggestions**: Stack vertically with swipe gestures
- **Navigation**: Simplified hamburger menu pattern

#### Touch Interactions
- **Target Size**: Minimum 44px touch targets
- **Spacing**: Increased spacing between interactive elements
- **Gestures**: Support swipe for suggestion actions
- **Keyboard**: Optimized for virtual keyboard appearance

### **Tablet (768px - 1024px)**
#### Hybrid Approach
- **Sidebar**: Condensed width (280px) with larger touch targets
- **Editor**: Comfortable reading width with adequate margins
- **Multi-touch**: Support pinch-to-zoom for accessibility
- **Orientation**: Optimized for both portrait and landscape

### **Desktop (1024px+)**
#### Full Experience
- **Sidebar**: Full 320px width with hover states
- **Keyboard Shortcuts**: Comprehensive keyboard navigation
- **Multiple Windows**: Support for multiple document tabs
- **Precision**: Hover states and detailed interactions

---

## Accessibility Guidelines

### **Visual Accessibility**
#### Color & Contrast
- **Minimum Contrast**: 4.5:1 for normal text, 3:1 for large text
- **Color Independence**: Never rely solely on color to convey information
- **Focus Indicators**: Clear, consistent focus indicators throughout
- **Text Sizing**: Support up to 200% zoom without horizontal scrolling

#### Typography
- **Font Size**: Minimum 16px for body text, 18px for editor
- **Font Choice**: High-legibility fonts (system fonts preferred)
- **Line Spacing**: Minimum 1.5x font size for paragraph text
- **Text Alignment**: Left-aligned for optimal readability

### **Interaction Accessibility**
#### Keyboard Navigation
- **Tab Order**: Logical tab sequence through all interactive elements
- **Skip Links**: Skip navigation options for screen reader users
- **Shortcuts**: Alt/Ctrl key combinations for common actions
- **Escape Routes**: Easy exit from modal dialogs and focused states

#### Screen Reader Support
- **ARIA Labels**: Comprehensive labeling for all interface elements
- **Live Regions**: Announcements for dynamic content changes
- **Semantic HTML**: Proper heading hierarchy and landmark roles
- **Alternative Text**: Descriptive text for all visual information

---

## Animation & Transition Guidelines

### **Performance Principles**
- **60fps Target**: All animations maintain smooth 60fps performance
- **Reduced Motion**: Respect user's reduced motion preferences
- **Duration**: Quick micro-interactions (150-300ms), longer for complex changes (400-600ms)
- **Easing**: Natural easing curves (ease-out for entrances, ease-in for exits)

### **Specific Animations**
#### Suggestion Interactions
- **Underline Appearance**: Fade in over 200ms
- **Sidebar Toggle**: Slide animation over 300ms with bounce easing
- **Card Expansion**: Height animation with content fade-in
- **Loading States**: Subtle pulse or skeleton loading patterns

#### Page Transitions
- **Route Changes**: Quick fade transitions (200ms)
- **Modal Dialogs**: Scale up from 0.95 with fade over 250ms
- **Tooltips**: Immediate appearance, delayed fade-out (100ms delay)
- **Form Validation**: Smooth error message appearance without layout shift

---

## Error Handling & Feedback

### **Error States**
#### Visual Treatment
- **Color Coding**: Consistent use of error colors without relying solely on color
- **Icons**: Clear error icons with semantic meaning
- **Typography**: Error text that's easily scannable
- **Positioning**: Errors appear near their relevant form fields

#### Educational Approach
- **Helpful Messages**: Explain what went wrong and how to fix it
- **Contextual Help**: Suggest next steps or alternative actions
- **Learning Opportunities**: Frame errors as learning moments for ESL users
- **Recovery**: Clear paths to resolve errors and continue workflow

### **Success States**
#### Confirmation Patterns
- **Visual Feedback**: Green checkmarks and success colors
- **Toast Messages**: Temporary success notifications
- **Progress Indication**: Show completion of multi-step processes
- **Celebration**: Subtle celebration for major achievements

---

## Loading & Performance

### **Loading States**
#### Skeleton Screens
- **Content Preview**: Show approximate content structure while loading
- **Progressive Loading**: Load most important content first
- **Feedback**: Clear indication that system is working
- **Timeout Handling**: Graceful handling of slow network conditions

#### Performance Optimization
- **Lazy Loading**: Load content as needed to improve initial load time
- **Image Optimization**: Responsive images with appropriate formats
- **Code Splitting**: Load only necessary JavaScript for current page
- **Caching Strategy**: Smart caching of frequently accessed content

---

## Content Guidelines

### **Microcopy Principles**
#### Tone & Voice
- **Encouraging**: Positive, supportive language for ESL learners
- **Clear**: Simple, direct language without jargon
- **Educational**: Explanatory without being condescending
- **Professional**: Academic tone appropriate for college students

#### Specific Copy Areas
- **Button Labels**: Action-oriented, specific verbs
- **Error Messages**: Helpful, solution-focused language
- **Empty States**: Encouraging, actionable guidance
- **Tooltips**: Concise educational content

### **Internationalization Considerations**
- **Text Expansion**: Allow for 30% text expansion in translations
- **RTL Support**: Design flexibility for right-to-left languages
- **Cultural Sensitivity**: Avoid culturally specific references
- **Font Support**: Ensure font choices support international characters

This comprehensive UI rules document serves as the foundation for creating a consistent, accessible, and educational user experience that supports ESL college students in their writing journey. 
