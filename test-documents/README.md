# Test Documents for Document-Type-Specific Suggestions

This folder contains example documents for testing the document-type-specific suggestion system in WordWise.ai. Each document is designed to trigger different types of suggestions based on its document type.

## How to Use These Test Documents

1. Copy the content from any of these files
2. Create a new document in WordWise.ai
3. Set the document type to match the example (essay, creative-writing, etc.)
4. Paste the content into the editor
5. Observe the document-specific suggestions that appear

## Document Types and Expected Suggestions

### 📝 Essay (`essay-example.md`)
**Document Type:** Essay

**Expected Suggestion Categories:**
- Thesis development and clarity
- Argument structure and flow
- Evidence presentation and analysis
- Transition effectiveness
- Conclusion strength
- Counter-argument addressing

**Test Focus:** The essay discusses social media's impact on communication, providing opportunities to test suggestions about thesis clarity, argument structure, and evidence presentation.

---

### 🎨 Creative Writing (`creative-writing-example.md`)
**Document Type:** Creative Writing

**Expected Suggestion Categories:**
- Character voice consistency
- Dialogue authenticity and flow
- Show vs. tell balance
- Sensory detail enhancement
- Scene setting effectiveness
- Pacing and tension building

**Test Focus:** A fantasy short story about a magical library, perfect for testing creative writing suggestions about character development, world-building, and narrative tension.

---

### 🎬 Script (`script-example.md`)
**Document Type:** Script

**Expected Suggestion Categories:**
- Character voice differentiation
- Dialogue naturalism
- Stage direction clarity
- Scene structure
- Action line effectiveness
- Format consistency

**Test Focus:** A short film script about a job interview, designed to test suggestions about dialogue, character development, and script formatting.

---

### 🎓 Academic (`academic-example.md`)
**Document Type:** Academic

**Expected Suggestion Categories:**
- Citation integration and format
- Methodology clarity
- Literature review coherence
- Data presentation
- Abstract effectiveness
- Academic tone consistency

**Test Focus:** A systematic review paper about AI in education, perfect for testing academic writing suggestions about citations, methodology, and scholarly tone.

---

### 💼 Business (`business-example.md`)
**Document Type:** Business

**Expected Suggestion Categories:**
- Professional tone maintenance
- Action-oriented language
- Call-to-action clarity
- Executive summary effectiveness
- Data visualization suggestions
- Strategic language precision

**Test Focus:** A quarterly sales report with achievements, challenges, and recommendations, designed to test business writing suggestions about professional communication and strategic language.

---

### 📧 Email (`email-example.md`)
**Document Type:** Email

**Expected Suggestion Categories:**
- Subject line clarity and urgency
- Opening appropriateness
- Message conciseness
- Action item clarity
- Professional closing
- Recipient consideration

**Test Focus:** A project update email with action items and milestones, perfect for testing email-specific suggestions about clarity, professionalism, and actionability.

---

### ✍️ General (`general-example.md`)
**Document Type:** General

**Expected Suggestion Categories:**
- Clarity and readability improvement
- Word choice precision
- Sentence variety and flow
- Paragraph structure
- Transition smoothness
- Overall coherence

**Test Focus:** A how-to guide about gardening, designed to test general writing suggestions that apply across all document types.

## Testing Notes

### Content Variations
Each document includes different writing issues that should trigger suggestions:
- **Passive voice usage** (for business and academic documents)
- **Weak transitions** (for essays and general writing)
- **Dialogue formatting** (for scripts and creative writing)
- **Technical jargon** (for academic and business documents)
- **Informal language** (in professional contexts)

### Expected Behavior
- Suggestions should be contextually appropriate for each document type
- Creative writing should NOT receive business writing suggestions
- Academic papers should get citation and methodology suggestions
- Scripts should receive formatting and dialogue suggestions
- Emails should focus on clarity and professional communication

### Suggestion Categories
The AI should identify the document type and provide suggestions from the appropriate category pool:
- Document-specific categories (e.g., "thesis-development" for essays)
- General categories that apply to all types (e.g., "clarity-improvement")
- Contextually relevant suggestions based on content analysis

## Troubleshooting

If you're not seeing document-specific suggestions:
1. Verify the document type is set correctly in the editor
2. Check that the Firebase functions are deployed with the latest updates
3. Ensure the document content is substantial enough to trigger analysis
4. Look for suggestions in both the sidebar and inline popover

## Adding New Test Documents

When adding new test documents:
1. Create a file with the format `[document-type]-example.md`
2. Include content that would naturally trigger that document type's specific suggestions
3. Add common writing issues that the AI should catch
4. Update this README with the new document's testing purpose 
