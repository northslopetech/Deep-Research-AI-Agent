# Session Tracking Implementation - Summary

## Overview

The Deep Research Agent now creates **Session** and **Session Event** objects in Foundry Ontology to track the complete lifecycle of research sessions. This provides:

✅ **Complete audit trail** of all research activities
✅ **Real-time progress tracking** with 11 different event types
✅ **Easy debugging** - identify where issues occur
✅ **Performance analytics** - analyze token usage, timing, iterations
✅ **User attribution** - track who performed each research session

## Quick Start

### 1. Test Session Tracking

```bash
npm run test:session
```

This will:
- Generate a unique session ID
- Create 11 session events
- Create a final Session object
- Output the session ID for verification in Foundry

### 2. Start a Research Session

When making a research request, optionally include `currentUser`:

```json
{
  "topic": "Your research topic",
  "clarifications": [...],
  "currentUser": "your.email@company.com"
}
```

If not provided, defaults to `"anonymous"`.

### 3. Monitor Logs

Watch for session tracking logs:

```
[2026-01-13T...] [SESSION:a1b2c3d4] [INIT] Generated new session ID: a1b2c3d4-...
[2026-01-13T...] [SESSION:a1b2c3d4] [EVENT] ✅ Session event created successfully
```

## What Was Created

### New Files

| File | Purpose |
|------|---------|
| `src/app/api/deep-research/session-tracker.ts` | Core session tracking logic |
| `docs/SESSION_TRACKING.md` | Complete documentation |
| `docs/SESSION_TRACKING_IMPLEMENTATION.md` | Implementation details |
| `scripts/test-session-tracking.ts` | Test script |

### Modified Files

| File | Changes |
|------|---------|
| `src/app/api/deep-research/types.ts` | Added `sessionId` and `currentUser` |
| `src/app/api/deep-research/main.ts` | Integrated session tracking at 11 milestones |
| `src/app/api/deep-research/route.ts` | Parse `currentUser`, handle failures |
| `CLAUDE.md` | Added session tracking section |
| `package.json` | Added `test:session` script |

## Session Event Types

| Status | When | Info Captured |
|--------|------|---------------|
| `STARTED` | Research begins | Topic |
| `PLANNING_COMPLETE` | Queries generated | Query count |
| `ITERATION_STARTED` | Each iteration | Iteration #, query count |
| `SEARCH_COMPLETE` | Search done | Result count |
| `EXTRACTION_COMPLETE` | Content extracted | Findings count |
| `ANALYSIS_COMPLETE` | Analysis done | Sufficiency, gaps |
| `LOOP_COMPLETE` | Loop ends | Total iterations, findings |
| `REPORT_STARTED` | Report begins | - |
| `REPORT_COMPLETE` | Report done | Report length |
| `COMPLETED` | Success | Total time, tokens |
| `FAILED` | Error | Error message |

## Objects Created in Foundry

### Session Event Object

**Type:** `[DeepResearch] Session Event`

**Properties:**
- `primaryKey_` (string) - Auto-generated
- `sessionId` (string) - Links to parent Session
- `createdAt` (timestamp) - When event occurred
- `status` (string) - Event type (STARTED, PLANNING_COMPLETE, etc.)
- `message` (string) - Descriptive message
- `error` (boolean) - Whether this is an error event

### Session Object

**Type:** `[T11] Session`

**Properties:**
- `sessionId` (string) - Primary key, matches Session Events
- `userId` (string) - User who performed research
- `title` (string) - Research title
- `query` (string) - Original research topic
- `report` (string) - Complete markdown report
- `time` (timestamp) - Completion time

**Link:** `sessionEvents` → All Session Events for this session

## Example Usage

### Query Session Events

```typescript
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
import { client } from "./client";

// Get all events for a session
const events = await client(SessionEvent)
  .where({ sessionId: { $eq: "your-session-id" } })
  .fetchPage({ 
    $orderBy: { createdAt: "asc" },
    $pageSize: 100 
  });

console.log(`Found ${events.data.length} events`);
events.data.forEach(event => {
  console.log(`${event.createdAt} - ${event.status}: ${event.message}`);
});
```

### Query Session with Events

```typescript
import { Session } from "@gmahler-deep-research-service-user/sdk";
import { client } from "./client";

// Get session
const session = await client(Session).fetchOne("your-session-id");
console.log("Topic:", session.query);
console.log("User:", session.userId);
console.log("Report length:", session.report.length);

// Get linked events
const events = await session.$link.sessionEvents.fetchPage();
console.log(`Session has ${events.data.length} events`);
```

### Find Sessions by User

```typescript
import { Session } from "@gmahler-deep-research-service-user/sdk";
import { client } from "./client";

const userSessions = await client(Session)
  .where({ userId: { $eq: "user@company.com" } })
  .fetchPage({ 
    $orderBy: { time: "desc" },
    $pageSize: 10 
  });

console.log(`User has ${userSessions.data.length} recent sessions`);
```

## Configuration

### Required Environment Variables

```bash
FOUNDRY_BASE_URL=https://your-instance.palantirfoundry.com
FOUNDRY_TOKEN=your_token_here
```

### Required Package

```bash
npm install @gmahler-deep-research-service-user/sdk
```

## Logging

All session operations are logged with:

- **Timestamps** - ISO 8601 format
- **Session ID prefix** - First 8 characters for easy filtering
- **Visual indicators**:
  - ✅ Success
  - ⚠️ Warning
  - ❌ Error

**Example logs:**

```
[2026-01-13T10:30:00.000Z] [SESSION:a1b2c3d4] [INIT] Generated new session ID: a1b2c3d4-...
[2026-01-13T10:30:00.100Z] [SESSION:a1b2c3d4] [EVENT] Creating session event - Status: STARTED
[2026-01-13T10:30:00.150Z] [SESSION:a1b2c3d4] [EVENT] Message: Research session started for topic: "..."
[2026-01-13T10:30:00.200Z] [SESSION:a1b2c3d4] [EVENT] ✅ Session event created successfully
```

## Error Handling

- All session tracking operations are wrapped in try-catch
- Failures are logged but **do not interrupt research**
- If research fails, a `FAILED` session event is created
- Session tracking failures don't stop the research process

## Troubleshooting

### Session Tracking Not Working

**Check:**
1. Environment variables are set (FOUNDRY_BASE_URL, FOUNDRY_TOKEN)
2. SDK package is installed
3. User has permissions to create Session/SessionEvent objects
4. Network connectivity to Foundry

**View logs:**
```bash
# Look for session tracking logs
npm run dev 2>&1 | grep SESSION
```

### Session Events Created but No Final Session

**Cause:** Research failed before completion

**Solution:** Check for `FAILED` event or error logs

### Permission Denied Errors

**Solution:** Verify user has write permissions for:
- Action: `createSessionEvent`
- Action: `deepResearchCreateDeepResearchSessionWithIdAction`

## Documentation

📖 **Complete Documentation:** `docs/SESSION_TRACKING.md`
📋 **Implementation Details:** `docs/SESSION_TRACKING_IMPLEMENTATION.md`
🔧 **Project Guide:** `CLAUDE.md` (Session Tracking section)

## Testing

```bash
# Test session tracking independently
npm run test:session

# Start dev server and monitor logs
npm run dev

# Make a research request
curl -X POST http://localhost:3000/api/deep-research \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"content":"{\"topic\":\"test\",\"currentUser\":\"test@example.com\"}"}]}'
```

## Benefits

✅ **Auditability** - Complete history of all research
✅ **Debugging** - Easy to identify where issues occurred
✅ **Analytics** - Analyze research patterns, performance
✅ **Traceability** - Link reports back to execution details
✅ **Monitoring** - Real-time visibility into research progress
✅ **User Tracking** - Know who performed each research session
✅ **Non-Intrusive** - Failures don't break the research flow

## Next Steps

1. **Run Test:** `npm run test:session`
2. **Start Research:** Make a research request with monitoring
3. **Verify Objects:** Check Foundry Ontology for created objects
4. **Build Dashboard:** Create UI to view session history
5. **Add Analytics:** Analyze research patterns and performance

---

**Created:** January 13, 2026
**Author:** Deep Research AI Agent Team
**Status:** ✅ Complete and tested
