# Meeting Mind

## Current State
New project. No existing code or data structures.

## Requested Changes (Diff)

### Add
- A meeting minute record app called "Meeting Mind"
- Transcript input: users can paste raw text OR upload a .txt file
- Template-based structured form with the following sections:
  - Executive Summary (3-sentence field)
  - Key Decisions Made (dynamic bulleted list with optional owner field)
  - Action Item Tracker (table with Task, Owner, Deadline columns; rows can be added/removed)
  - Discussion Deep-Dive (3-4 topic categories, each with perspectives and consensus fields)
  - Parking Lot / Next Steps (dynamic list of deferred topics)
- Meeting metadata: title, date, participants list
- Saved records: users can save completed meeting minute records and revisit them later
- Record list/history view: browse past saved meeting records
- Record detail view: view a saved record in a clean formatted output optimized for scanning
- Export/copy: ability to copy the formatted record to clipboard
- Pre-fill helper: when a transcript is pasted or uploaded, it populates the meeting title and date from the text if detectable; otherwise fields stay blank for manual entry

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend (Motoko):
   - Data types: MeetingRecord with id, title, date, participants, executiveSummary, decisions (array), actionItems (array of {task, owner, deadline}), discussionTopics (array of {category, perspectives, consensus}), parkingLot (array), transcriptText, createdAt
   - CRUD: createRecord, updateRecord, getRecord, listRecords, deleteRecord

2. Frontend:
   - Dashboard/Home: list of saved meeting records with title, date, participant count; empty state with CTA
   - New Record flow:
     - Step 1: Transcript input (paste textarea + .txt file upload button)
     - Step 2: Structured form with all 5 sections, pre-filled where possible
   - Record Detail view: formatted, scannable output with all sections rendered beautifully; copy-to-clipboard button
   - Edit: open any saved record back in form view
   - Delete: with confirmation dialog
