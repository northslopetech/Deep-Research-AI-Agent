# Session Tracking - Complete Implementation Guide

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [What Was Implemented](#what-was-implemented)
3. [How It Works](#how-it-works)
4. [Files Created/Modified](#files-createdmodified)
5. [Testing](#testing)
6. [Documentation](#documentation)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### 1. Run the Test Script

```bash
npm run test:session
```

This will create a complete test session with all event types and a final Session object.

### 2. Start a Research Session

```bash
npm run dev
```

Then make a research request:

```bash
curl -X POST http://localhost:3000/api/deep-research \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "content": "{\"topic\":\"Palantir Foundry features\",\"clarifications\":[],\"currentUser\":\"test@example.com\"}"
    }]
  }'
```

### 3. Monitor Logs

Watch for session tracking logs:

```
[2026-01-13T...] [SESSION:a1b2c3d4] [INIT] Generated new session ID: a1b2c3d4-...
[2026-01-13T...] [SESSION:a1b2c3d4] [EVENT] ✅ Session event created successfully
```

### 4. Query Foundry

After research completes, query the created objects in Foundry:

```typescript
import { Session, SessionEvent } from "@gmahler-deep-research-service-user/sdk";
import { client } from "./client";

// Get session
const session = await client(Session).fetchOne("your-session-id");

// Get events
const events = await client(SessionEvent)
  .where({ sessionId: { $eq: "your-session-id" } })
  .fetchPage({ $orderBy: { createdAt: "asc" } });
```

---

## 📦 What Was Implemented

### Session Tracking System

A complete session tracking system that:

✅ **Generates unique session IDs** for each research session
✅ **Creates 11 types of Session Events** at key milestones
✅ **Creates final Session object** with complete report
✅ **Links all events** to parent session via sessionId
✅ **Tracks user attribution** (who performed research)
✅ **Provides comprehensive logging** with timestamps and status
✅ **Handles errors gracefully** (tracking failures don't break research)
✅ **Includes test script** to verify functionality

### Objects Created in Foundry

#### 1. Session Event (`[DeepResearch] Session Event`)

Created at these 11 milestones:

| Event | When | Information |
|-------|------|-------------|
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

**Properties:**
- `primaryKey_` - Auto-generated unique ID
- `sessionId` - Links to parent Session
- `createdAt` - ISO 8601 timestamp
- `status` - Event type
- `message` - Descriptive text
- `error` - Boolean flag

#### 2. Session (`[T11] Session`)

Created at the end with complete report.

**Properties:**
- `sessionId` - Primary key (UUID)
- `userId` - User who performed research
- `title` - Research title
- `query` - Original topic
- `report` - Complete markdown report
- `time` - Completion timestamp

**Link:** `sessionEvents` → All Session Events

---

## 🔧 How It Works

### Flow Diagram

```
Research Starts
    ↓
Generate Session ID (UUID)
    ↓
Create Event: STARTED
    ↓
Planning → Event: PLANNING_COMPLETE
    ↓
Loop (1..N iterations)
    ├─ Event: ITERATION_STARTED
    ├─ Event: SEARCH_COMPLETE
    ├─ Event: EXTRACTION_COMPLETE
    └─ Event: ANALYSIS_COMPLETE
    ↓
Event: LOOP_COMPLETE
    ↓
Report Generation
    ├─ Event: REPORT_STARTED
    └─ Event: REPORT_COMPLETE
    ↓
Event: COMPLETED
    ↓
Create Session Object
```

### Key Functions

**`session-tracker.ts`:**

```typescript
// Generate unique session ID
generateSessionId(): string

// Create session event
createSessionEventObject(
  sessionId: string,
  status: string,
  message: string,
  error: boolean
): Promise<void>

// Create final session
createSessionObject(
  sessionId: string,
  currentUser: string,
  query: string,
  title: string,
  report: string
): Promise<void>

// Helper functions
SessionEvents.started(sessionId, topic)
SessionEvents.planningCompleted(sessionId, queryCount)
// ... etc
```

---

## 📁 Files Created/Modified

### New Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/app/api/deep-research/session-tracker.ts` | Core tracking logic | ~250 |
| `docs/SESSION_TRACKING.md` | Complete documentation | ~400 |
| `docs/SESSION_TRACKING_IMPLEMENTATION.md` | Implementation guide | ~500 |
| `docs/SESSION_TRACKING_FLOW.md` | Flow diagrams | ~350 |
| `docs/README_SESSION_TRACKING.md` | This file | ~300 |
| `scripts/test-session-tracking.ts` | Test script | ~150 |
| `SESSION_TRACKING_SUMMARY.md` | Quick reference | ~300 |

### Modified Files

| File | Changes |
|------|---------|
| `src/app/api/deep-research/types.ts` | Added `sessionId` and `currentUser` to ResearchState |
| `src/app/api/deep-research/main.ts` | Integrated session tracking at 11 milestones |
| `src/app/api/deep-research/route.ts` | Parse `currentUser`, handle failures |
| `CLAUDE.md` | Added Session Tracking section |
| `package.json` | Added `test:session` script |

---

## 🧪 Testing

### Automated Test

```bash
npm run test:session
```

**What it does:**
1. Generates a session ID
2. Creates 11 session events in sequence
3. Creates a final Session object
4. Outputs session ID for verification

**Expected output:**
```
=== Testing Session Tracking ===

1. Generating Session ID...
✓ Session ID generated: a1b2c3d4-5678-90ab-cdef-1234567890ab

2. Creating STARTED event...
✓ STARTED event created

... (9 more events) ...

12. Creating final Session object...
✓ Session object created

=== Test Completed Successfully ===
```

### Manual Test

1. Start dev server: `npm run dev`
2. Make research request (see Quick Start)
3. Monitor logs for session tracking
4. Query Foundry for created objects

---

## 📚 Documentation

### Complete Documentation

| Document | Purpose |
|----------|---------|
| **SESSION_TRACKING.md** | Complete feature documentation |
| **SESSION_TRACKING_IMPLEMENTATION.md** | Implementation details and testing |
| **SESSION_TRACKING_FLOW.md** | Visual flow diagrams |
| **README_SESSION_TRACKING.md** | This quick start guide |
| **SESSION_TRACKING_SUMMARY.md** | One-page summary |

### Key Sections

- **Architecture** - How it works
- **API Reference** - All functions and parameters
- **Usage Examples** - Query patterns
- **Configuration** - Environment variables
- **Troubleshooting** - Common issues

---

## 🔍 Troubleshooting

### Issue: "Cannot find module '@gmahler-deep-research-service-user/sdk'"

**Solution:**
```bash
# Check .npmrc configuration
cat .npmrc

# Install SDK package
npm install @gmahler-deep-research-service-user/sdk
```

### Issue: Session events created but no final Session object

**Cause:** Research failed before completion

**Solution:**
1. Check logs for errors
2. Look for `FAILED` session event
3. Fix underlying research issue

### Issue: "FOUNDRY_BASE_URL and FOUNDRY_TOKEN must be set"

**Solution:**
```bash
# Create .env.local or .envrc
echo "FOUNDRY_BASE_URL=https://your-instance.palantirfoundry.com" >> .env.local
echo "FOUNDRY_TOKEN=your_token_here" >> .env.local

# Restart dev server
npm run dev
```

### Issue: Permission denied errors

**Solution:**
1. Verify user has write permissions in Foundry Ontology
2. Check action permissions:
   - `createSessionEvent`
   - `deepResearchCreateDeepResearchSessionWithIdAction`

### Issue: Session tracking not working but research succeeds

**Behavior:** This is expected! Session tracking failures don't interrupt research.

**Solution:**
1. Check logs for session tracking errors
2. Verify OSDK configuration
3. Test with `npm run test:session`

---

## 🎯 Benefits

✅ **Complete Audit Trail** - Every research step tracked
✅ **Easy Debugging** - Identify where issues occur
✅ **Performance Analytics** - Analyze token usage, timing, iterations
✅ **User Attribution** - Track who performed research
✅ **Report Linking** - Link reports to execution details
✅ **Non-Intrusive** - Failures don't break research
✅ **Real-Time Monitoring** - Track progress as it happens
✅ **Queryable History** - Easy to search and filter sessions

---

## 🔗 Related Documentation

- **OSDK Actions:** See `docs/ref docs/` for action specifications
- **Project Structure:** See `CLAUDE.md` for overall architecture
- **Deep Research API:** See `docs/DEEP_RESEARCH_API.md`
- **Foundry Setup:** See `docs/FOUNDRY_SETUP.md`

---

## 📞 Support

For issues or questions:

1. Check logs: `npm run dev 2>&1 | grep SESSION`
2. Run test: `npm run test:session`
3. Review documentation in `docs/SESSION_TRACKING*.md`
4. Check Foundry Ontology for created objects

---

**Status:** ✅ Complete and tested
**Version:** 1.0.0
**Last Updated:** January 13, 2026
