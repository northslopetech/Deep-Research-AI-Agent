# Session Tracking Documentation

## Overview

The Deep Research Agent now tracks research sessions and their progress using Palantir Foundry's Ontology. This creates a complete audit trail of research activities, making it easy to:

- Monitor research progress in real-time
- Debug issues by reviewing session events
- Analyze research patterns and performance
- Link research reports back to their execution history

## Architecture

### Objects Created

1. **Session Events** (`[DeepResearch] Session Event`)
   - Created at important milestones throughout the research process
   - Track individual steps with timestamps, status, and messages
   - Linked to the parent Session via `sessionId`

2. **Session** (`[T11] Session`)
   - Created at the end of a successful research session
   - Contains the complete research report, query, and metadata
   - Primary key is the `sessionId` generated at the start

### Data Flow

```
Research Starts
    ↓
Generate Session ID (UUID)
    ↓
Create Session Event: "STARTED"
    ↓
Planning Phase → Session Event: "PLANNING_COMPLETE"
    ↓
Research Loop (1..N iterations)
    ├─ Session Event: "ITERATION_STARTED"
    ├─ Session Event: "SEARCH_COMPLETE"
    ├─ Session Event: "EXTRACTION_COMPLETE"
    └─ Session Event: "ANALYSIS_COMPLETE"
    ↓
Session Event: "LOOP_COMPLETE"
    ↓
Report Generation
    ├─ Session Event: "REPORT_STARTED"
    └─ Session Event: "REPORT_COMPLETE"
    ↓
Session Event: "COMPLETED"
    ↓
Create Final Session Object
```

## Session Event Types

| Status | When Created | Information Captured |
|--------|-------------|---------------------|
| `STARTED` | Research begins | Topic |
| `PLANNING_COMPLETE` | Initial queries generated | Query count |
| `ITERATION_STARTED` | Each iteration begins | Iteration number, query count |
| `SEARCH_COMPLETE` | Search results retrieved | Iteration number, result count |
| `EXTRACTION_COMPLETE` | Content extracted | Iteration number, findings count |
| `ANALYSIS_COMPLETE` | Analysis performed | Iteration number, sufficiency, gaps |
| `LOOP_COMPLETE` | Research loop ends | Total iterations, findings |
| `REPORT_STARTED` | Report generation begins | - |
| `REPORT_COMPLETE` | Report generated | Report length |
| `COMPLETED` | Session finishes successfully | Total time, token usage |
| `FAILED` | Error occurs | Error message |

## Implementation Details

### Session Tracker Module

**File:** `src/app/api/deep-research/session-tracker.ts`

Key functions:

```typescript
// Generate unique session ID
generateSessionId(): string

// Create a session event
createSessionEventObject(
  sessionId: string,
  status: string,
  message: string,
  error: boolean
): Promise<void>

// Create final session object
createSessionObject(
  sessionId: string,
  currentUser: string,
  query: string,
  title: string,
  report: string
): Promise<void>

// Helper functions for common events
SessionEvents.started(sessionId, topic)
SessionEvents.planningCompleted(sessionId, queryCount)
SessionEvents.iterationStarted(sessionId, iteration, queryCount)
// ... etc
```

### Integration Points

**File:** `src/app/api/deep-research/main.ts`

Session tracking is integrated at these points:

1. **Initialization** - Generate session ID and create STARTED event
2. **Planning** - Create PLANNING_COMPLETE event
3. **Each Iteration** - Create ITERATION_STARTED event
4. **Search** - Create SEARCH_COMPLETE event
5. **Extraction** - Create EXTRACTION_COMPLETE event
6. **Analysis** - Create ANALYSIS_COMPLETE event
7. **Loop End** - Create LOOP_COMPLETE event
8. **Report Generation** - Create REPORT_STARTED and REPORT_COMPLETE events
9. **Completion** - Create COMPLETED event and final Session object

### Error Handling

**File:** `src/app/api/deep-research/route.ts`

If an error occurs during research:
- A `FAILED` session event is created with the error message
- The error is logged but doesn't stop execution
- Session tracking failures are logged but don't interrupt research

All session tracking operations are wrapped in try-catch blocks to ensure that failures in session tracking don't break the research process.

## OSDK Functions Used

### Create Session Event

**Action:** `createSessionEvent`

**Parameters:**
- `sessionId` (string) - Links to parent Session
- `createdAt` (timestamp) - ISO 8601 timestamp
- `status` (string) - Event status/type
- `error` (boolean) - Whether this is an error event
- `message` (string) - Descriptive message

### Create Session

**Action:** `deepResearchCreateDeepResearchSessionWithIdAction`

**Parameters:**
- `id` (string) - Session ID (matches sessionId in events)
- `currentUser` (string) - User performing the research
- `query` (string) - Original research topic
- `title` (string) - Shortened title for display
- `report` (string) - Complete research report

## Configuration

### Required Environment Variables

```bash
FOUNDRY_BASE_URL=https://your-instance.palantirfoundry.com
FOUNDRY_TOKEN=your_token_here
```

### Optional: Pass Current User

To track which user performed the research, include `currentUser` in the request:

```json
{
  "topic": "Research topic",
  "clarifications": [...],
  "currentUser": "john.doe@company.com"
}
```

If not provided, defaults to `"anonymous"`.

## Logging

Session tracking includes comprehensive logging with:

- Timestamps for all operations
- Session ID prefix for easy filtering
- Success/failure indicators (✅, ⚠️, ❌)
- Detailed error messages

**Example log output:**

```
[2026-01-13T10:30:00.000Z] [SESSION:a1b2c3d4] [INIT] Generated new session ID: a1b2c3d4-...
[2026-01-13T10:30:00.100Z] [SESSION:a1b2c3d4] [EVENT] Creating session event - Status: STARTED, Error: false
[2026-01-13T10:30:00.200Z] [SESSION:a1b2c3d4] [EVENT] ✅ Session event created successfully
```

## Querying Session Data

### Find Sessions by User

```typescript
import { Session } from "@gmahler-deep-research-service-user/sdk";
import { client } from "./client";

const userSessions = await client(Session)
  .where({ userId: { $eq: "john.doe@company.com" } })
  .fetchPage();
```

### Find Session Events for a Session

```typescript
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
import { client } from "./client";

const events = await client(SessionEvent)
  .where({ sessionId: { $eq: "a1b2c3d4-..." } })
  .fetchPage({ $orderBy: { createdAt: "asc" } });
```

### Get Session with All Events

```typescript
import { Session } from "@gmahler-deep-research-service-user/sdk";
import { client } from "./client";

const session = await client(Session).fetchOne("session-id");
const events = await session.$link.sessionEvents.fetchPage();
```

## Benefits

1. **Auditability** - Complete history of all research activities
2. **Debugging** - Easy to identify where issues occurred
3. **Analytics** - Analyze research patterns, iteration counts, token usage
4. **Traceability** - Link reports back to execution details
5. **Monitoring** - Real-time visibility into research progress

## Troubleshooting

### Session Events Not Created

**Check:**
1. FOUNDRY_BASE_URL and FOUNDRY_TOKEN are set
2. OSDK package `@gmahler-deep-research-service-user/sdk` is installed
3. User has permissions to create Session and SessionEvent objects
4. Network connectivity to Foundry

**Solution:**
Session tracking failures are logged but don't interrupt research. Check console logs for detailed error messages.

### Session Object Not Created

**Check:**
1. All Session Events were created successfully
2. Research completed without errors
3. Report was generated successfully

**Solution:**
The final Session object is only created if research completes successfully. If an error occurs, only Session Events up to the failure point will be created.

## Future Enhancements

Potential improvements:

1. **Streaming Updates** - Real-time event streaming to UI
2. **Performance Metrics** - Track query performance, LLM response times
3. **Cost Tracking** - Link to token usage and estimated costs
4. **Comparison Tools** - Compare multiple sessions on the same topic
5. **Session Replay** - Reconstruct research flow from events
6. **Alerts** - Notify on long-running or failed sessions
