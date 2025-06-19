# User Flow - WordWise.ai

A comprehensive user journey document for the AI-powered writing assistant designed specifically for ESL college students.

---

## Target User Persona

**ESL College Students** writing:
- Academic essays and papers
- Creative writing projects
- Scripts and screenplays
- General academic assignments

---

## Primary User Journey

### 1. Initial Access & Authentication

**Entry Point:** User visits WordWise.ai web application

**Authentication Flow:**
- **New Users:** 
  - Click "Sign Up"
  - Choose authentication method:
    - Email + Password registration
    - Google Sign-In
  - Complete account creation
  - Redirect to dashboard

- **Returning Users:**
  - Click "Log In" 
  - Choose authentication method:
    - Email + Password
    - Google Sign-In
  - Redirect to dashboard

### 2. Document Selection & Creation

**Dashboard Landing:**
- View saved documents (if any exist)
- Choose document action:

**Path A: Create New Document**
- Click "New Document"
- Document opens in rich text editor
- Begin writing immediately

**Path B: Upload Existing Document**
- Click "Upload Document"
- Select file from computer (supports common text formats: .txt, .doc, .docx, .rtf, .pdf)
- Document content loads into rich text editor
- Ready for editing and analysis

**Path C: Open Saved Document**
- Click on existing document from dashboard
- Document opens in rich text editor
- Continue editing from last save point

### 3. Writing & Real-Time Analysis

**Core Editor Experience:**
- User writes/edits text in rich text editor
- **Analysis Trigger:** System analyzes text 2 seconds after user stops typing
- **Suggestion Display:** Two concurrent presentation methods:

**Inline Suggestions:**
- Spelling errors: Red squiggly underlines
- Grammar errors: Green squiggly underlines  
- Style suggestions: Blue squiggly underlines
- Click on underlined text to view suggestion options

**Sidebar Analysis:**
- **Grammar Tab:** Lists all grammatical issues with explanations
- **Style Tab:** Presents style improvement suggestions
- **Readability Tab:** Shows readability metrics and enhancement recommendations

### 4. Suggestion Review & Application

**Individual Suggestion Handling:**
- Click on inline suggestion or sidebar item
- Review suggestion with explanation
- Choose action:
  - Accept suggestion (applies change)
  - Reject suggestion (dismisses)
  - Ignore (temporarily dismiss, may reappear with future analysis)

**Bulk Suggestion Management:**
- **"Apply All" Button:** Available in each sidebar category
- Applies all suggestions in that category simultaneously
- User can still review individual changes before final application

### 5. Iterative Writing Process

**Continuous Improvement Cycle:**
- User continues writing/editing
- New suggestions appear as content changes
- Previous suggestions update based on context
- Real-time feedback enables immediate improvement

### 6. Document Management

**Saving & Organization:**
- Documents auto-save as user writes (creates new version in history)
- Manual save option available (creates new version in history)
- **Version History Feature:**
  - Each save action creates a timestamped version in document history
  - Users can access "Version History" from document menu or sidebar
  - History displays chronological list of all document versions with:
    - Timestamp of save
    - Preview of content changes (if any)
    - Option to view full version
  - Users can:
    - Browse through any previous version
    - Open any historical version in read-only mode
    - Restore any previous version as the current working document
    - Compare versions side-by-side (optional enhancement)
- Documents stored in user's dashboard with complete version history
- No collaboration features (single-user editing only)

**Completion & Export:**
- User can download completed document in various formats
- Export options include current version or any historical version
- Return to dashboard to access other documents
- Log out when session complete

---

## Alternative User Flows

### Academic Paper Flow
- Upload existing draft document
- Focus on advanced style and readability suggestions
- Iterate through multiple revision cycles
- Use version history to track progress and revert if needed
- Download final polished version

### Creative Writing Flow
- Start with blank document
- Focus on style and tone suggestions
- Use readability analysis to ensure accessibility
- Leverage version history to explore different creative directions
- Continuous iterative improvement

### Version Recovery Flow
- User accidentally deletes content or makes unwanted changes
- Access "Version History" from document menu
- Browse previous versions to find desired state
- Restore previous version to continue working
- Resume normal editing workflow

---

## Key User Interface Considerations

### Editor Interface
- Clean, distraction-free writing environment
- Prominent suggestion indicators without overwhelming the text
- Easy-to-access sidebar that doesn't interfere with writing flow
- Accessible version history controls (menu item, sidebar option)
- Responsive design for various screen sizes

### Suggestion Presentation
- Clear visual hierarchy between different suggestion types
- Explanatory tooltips for educational value (important for ESL learners)
- Non-intrusive but noticeable suggestion indicators
- Quick access to accept/reject actions

### Navigation Flow
- Simple dashboard for document management
- Seamless transition between documents
- Clear save status indicators with version information
- Easy authentication state management
- Intuitive version history browsing interface

### Version History Interface
- Clear chronological listing of document versions
- Easy-to-understand timestamps and change indicators
- Simple restore functionality with confirmation prompts
- Read-only preview mode for historical versions
- Quick return to current working version

---

## Success Metrics & User Goals

### Primary User Objectives
- Improve writing quality and accuracy
- Learn proper grammar and style conventions
- Increase confidence in English writing
- Produce polished academic and creative content
- Maintain writing progress and recover from mistakes

### Application Success Indicators
- High suggestion acceptance rate
- Reduced repeat errors over time
- Seamless writing workflow without interruption
- Clear educational value in suggestion explanations
- Effective use of version history for document recovery and progress tracking

---

This user flow serves as the foundation for architectural decisions, UI/UX design, and feature prioritization throughout the development process.
