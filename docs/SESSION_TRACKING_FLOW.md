# Session Tracking Flow Diagram

## Complete Research Session Flow with Session Tracking

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         RESEARCH REQUEST RECEIVED                        │
│                    (POST /api/deep-research)                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  INITIALIZATION                                                          │
│  • Parse request (topic, clarifications, currentUser, objectTypes)       │
│  • Create ResearchState object                                           │
│  • Generate unique Session ID (UUID)                                     │
│  • Set currentUser (or default to "anonymous")                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  SESSION EVENT #1: STARTED                                               │
│  • sessionId: <generated-uuid>                                           │
│  • status: "STARTED"                                                     │
│  • message: "Research session started for topic: <topic>"                │
│  • error: false                                                          │
│  • createdAt: <timestamp>                                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  PLANNING PHASE                                                          │
│  • Generate initial search queries (web + ontology)                      │
│  • Consider clarifications and object type filters                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  SESSION EVENT #2: PLANNING_COMPLETE                                     │
│  • status: "PLANNING_COMPLETE"                                           │
│  • message: "Planning completed - Generated N initial queries"           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         RESEARCH LOOP BEGINS                             │
│                    (Max MAX_ITERATIONS iterations)                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
                    ╔═══════════════════════════════════╗
                    ║   ITERATION N (N = 1, 2, 3...)    ║
                    ╚═══════════════════════════════════╝
                                    ↓
            ┌───────────────────────────────────────┐
            │  SESSION EVENT: ITERATION_STARTED     │
            │  • Iteration number                   │
            │  • Query count                        │
            └───────────────────────────────────────┘
                                    ↓
            ┌───────────────────────────────────────┐
            │  SEARCH PHASE                         │
            │  • Execute web searches (parallel)    │
            │  • Execute ontology searches (parallel)│
            │  • Collect all results                │
            └───────────────────────────────────────┘
                                    ↓
            ┌───────────────────────────────────────┐
            │  SESSION EVENT: SEARCH_COMPLETE       │
            │  • Iteration number                   │
            │  • Result count                       │
            └───────────────────────────────────────┘
                                    ↓
            ┌───────────────────────────────────────┐
            │  EXTRACTION PHASE                     │
            │  • Process each search result         │
            │  • Extract relevant content           │
            │  • Create findings summaries          │
            └───────────────────────────────────────┘
                                    ↓
            ┌───────────────────────────────────────┐
            │  SESSION EVENT: EXTRACTION_COMPLETE   │
            │  • Iteration number                   │
            │  • New findings count                 │
            └───────────────────────────────────────┘
                                    ↓
            ┌───────────────────────────────────────┐
            │  ANALYSIS PHASE                       │
            │  • Evaluate findings sufficiency      │
            │  • Identify gaps in coverage          │
            │  • Generate follow-up queries         │
            └───────────────────────────────────────┘
                                    ↓
            ┌───────────────────────────────────────┐
            │  SESSION EVENT: ANALYSIS_COMPLETE     │
            │  • Iteration number                   │
            │  • Sufficient: true/false             │
            │  • Gap count                          │
            └───────────────────────────────────────┘
                                    ↓
                        ┌─────────────────┐
                        │  Sufficient?    │
                        └─────────────────┘
                         ↓              ↓
                       YES             NO
                        ↓               ↓
              Exit Loop      More Iterations? ───No──→ Exit Loop
                        ↓               ↓
                        ↓              YES
                        ↓               ↓
                        ↓      ╔═══════════════════╗
                        ↓      ║  Next Iteration   ║
                        ↓      ╚═══════════════════╝
                        ↓               ↓
                        └───────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  SESSION EVENT: LOOP_COMPLETE                                            │
│  • Total iterations                                                      │
│  • Total findings count                                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  SESSION EVENT: REPORT_STARTED                                           │
│  • message: "Generating final research report"                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  REPORT GENERATION PHASE                                                 │
│  • Synthesize all findings                                               │
│  • Generate structured markdown report                                   │
│  • Include sources and citations                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  SESSION EVENT: REPORT_COMPLETE                                          │
│  • Report length (characters)                                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  SESSION EVENT: COMPLETED                                                │
│  • Total execution time                                                  │
│  • Total tokens used                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  CREATE FINAL SESSION OBJECT                                             │
│  [T11] Session                                                           │
│  • sessionId: <same-uuid>                                                │
│  • userId: <currentUser>                                                 │
│  • query: <original-topic>                                               │
│  • title: "Research: <topic>"                                            │
│  • report: <complete-markdown-report>                                    │
│  • time: <completion-timestamp>                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    STREAM REPORT TO CLIENT                               │
│                    RESEARCH COMPLETE ✅                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Error Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ERROR OCCURS AT ANY POINT                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  SESSION EVENT: FAILED                                                   │
│  • status: "FAILED"                                                      │
│  • message: <error-message>                                              │
│  • error: true                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                 ERROR RETURNED TO CLIENT                                 │
│                 (Session Events preserved for debugging)                 │
└─────────────────────────────────────────────────────────────────────────┘
```

## Object Relationships in Foundry

```
┌──────────────────────────────────────┐
│        [T11] Session                 │
│  ----------------------------------- │
│  sessionId (PK): <uuid>              │
│  userId: <user-email>                │
│  query: <topic>                      │
│  title: <short-title>                │
│  report: <markdown-report>           │
│  time: <timestamp>                   │
└──────────────────────────────────────┘
              ↑
              │ (linked via sessionId)
              │
      ┌───────┴────────┐
      │                │
┌─────┴────────────────┴────────────────────────────────────────┐
│   [DeepResearch] Session Event (multiple objects)              │
│  ------------------------------------------------------------ │
│  primaryKey_: <auto-generated>                                │
│  sessionId: <same-uuid>                                       │
│  createdAt: <timestamp>                                       │
│  status: STARTED | PLANNING_COMPLETE | ... | COMPLETED       │
│  message: <descriptive-text>                                  │
│  error: true | false                                          │
└──────────────────────────────────────────────────────────────┘
```

## OSDK Actions Used

### Creating Session Events

**Action:** `createSessionEvent`

```typescript
await client(createSessionEvent).applyAction({
  sessionId: "uuid-here",
  createdAt: "2026-01-13T10:30:00.000Z",
  status: "STARTED",
  error: false,
  message: "Research session started for topic: ..."
}, {
  $returnEdits: true
});
```

### Creating Final Session

**Action:** `deepResearchCreateDeepResearchSessionWithIdAction`

```typescript
await client(deepResearchCreateDeepResearchSessionWithIdAction).applyAction({
  id: "uuid-here",
  currentUser: "user@company.com",
  query: "Original research topic",
  title: "Research: Original research topic",
  report: "# Complete Markdown Report\n\n..."
}, {
  $returnEdits: true
});
```

## Timeline Example

Real-world example of a research session (5 minutes):

```
00:00.000  [STARTED]               Research begins
00:00.500  [PLANNING_COMPLETE]     5 queries generated
00:01.000  [ITERATION_STARTED]     Iteration 1, 5 queries
00:01.800  [SEARCH_COMPLETE]       15 results found
00:02.500  [EXTRACTION_COMPLETE]   12 findings extracted
00:03.000  [ANALYSIS_COMPLETE]     Not sufficient, 3 gaps
00:03.200  [ITERATION_STARTED]     Iteration 2, 3 queries
00:03.800  [SEARCH_COMPLETE]       8 results found
00:04.200  [EXTRACTION_COMPLETE]   6 findings extracted
00:04.600  [ANALYSIS_COMPLETE]     Sufficient: true
00:04.700  [LOOP_COMPLETE]         2 iterations, 18 findings
00:04.800  [REPORT_STARTED]        Report generation
00:05.200  [REPORT_COMPLETE]       5000 char report
00:05.300  [COMPLETED]             5300ms, 1500 tokens
00:05.400  Session object created
```

## Key Design Principles

1. **Non-Blocking:** Session tracking failures don't stop research
2. **Comprehensive:** 11 event types cover all major milestones
3. **Auditable:** Complete history with timestamps
4. **Linked:** All events link to parent Session via sessionId
5. **Informative:** Rich messages provide context
6. **Error-Aware:** Failed events marked with error flag
7. **User-Attributed:** Track who performed research
8. **Queryable:** Easy to query by user, topic, date, status
