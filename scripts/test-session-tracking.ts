#!/usr/bin/env tsx

/**
 * Test Script for Session Tracking
 * 
 * This script tests the session tracking functionality by:
 * 1. Generating a session ID
 * 2. Creating several Session Events
 * 3. Creating a final Session object
 * 4. Querying the created objects
 * 
 * Run with: npx tsx scripts/test-session-tracking.ts
 */

import { 
  generateSessionId, 
  createSessionEventObject, 
  createSessionObject,
  SessionEvents 
} from '../src/app/api/deep-research/session-tracker';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSessionTracking() {
  log('cyan', '\n=== Testing Session Tracking ===\n');

  try {
    // 1. Generate Session ID
    log('blue', '1. Generating Session ID...');
    const sessionId = generateSessionId();
    log('green', `✓ Session ID generated: ${sessionId}\n`);

    // Small delay between operations
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // 2. Create STARTED event
    log('blue', '2. Creating STARTED event...');
    await SessionEvents.started(sessionId, 'Test Research Topic');
    await delay(500);
    log('green', '✓ STARTED event created\n');

    // 3. Create PLANNING_COMPLETE event
    log('blue', '3. Creating PLANNING_COMPLETE event...');
    await SessionEvents.planningCompleted(sessionId, 5);
    await delay(500);
    log('green', '✓ PLANNING_COMPLETE event created\n');

    // 4. Create ITERATION_STARTED event
    log('blue', '4. Creating ITERATION_STARTED event...');
    await SessionEvents.iterationStarted(sessionId, 1, 5);
    await delay(500);
    log('green', '✓ ITERATION_STARTED event created\n');

    // 5. Create SEARCH_COMPLETE event
    log('blue', '5. Creating SEARCH_COMPLETE event...');
    await SessionEvents.searchCompleted(sessionId, 1, 10);
    await delay(500);
    log('green', '✓ SEARCH_COMPLETE event created\n');

    // 6. Create EXTRACTION_COMPLETE event
    log('blue', '6. Creating EXTRACTION_COMPLETE event...');
    await SessionEvents.extractionCompleted(sessionId, 1, 8);
    await delay(500);
    log('green', '✓ EXTRACTION_COMPLETE event created\n');

    // 7. Create ANALYSIS_COMPLETE event
    log('blue', '7. Creating ANALYSIS_COMPLETE event...');
    await SessionEvents.analysisCompleted(sessionId, 1, true, 0);
    await delay(500);
    log('green', '✓ ANALYSIS_COMPLETE event created\n');

    // 8. Create LOOP_COMPLETE event
    log('blue', '8. Creating LOOP_COMPLETE event...');
    await SessionEvents.loopCompleted(sessionId, 1, 8);
    await delay(500);
    log('green', '✓ LOOP_COMPLETE event created\n');

    // 9. Create REPORT_STARTED event
    log('blue', '9. Creating REPORT_STARTED event...');
    await SessionEvents.reportStarted(sessionId);
    await delay(500);
    log('green', '✓ REPORT_STARTED event created\n');

    // 10. Create REPORT_COMPLETE event
    log('blue', '10. Creating REPORT_COMPLETE event...');
    await SessionEvents.reportCompleted(sessionId, 5000);
    await delay(500);
    log('green', '✓ REPORT_COMPLETE event created\n');

    // 11. Create COMPLETED event
    log('blue', '11. Creating COMPLETED event...');
    await SessionEvents.completed(sessionId, 30000, 1500);
    await delay(500);
    log('green', '✓ COMPLETED event created\n');

    // 12. Create final Session object
    log('blue', '12. Creating final Session object...');
    const testReport = `# Test Research Report

## Executive Summary
This is a test report to verify session tracking functionality.

## Key Findings
1. Session tracking is working correctly
2. All events were created successfully
3. Final session object created with report

## Conclusion
Session tracking implementation is functioning as expected.
`;

    await createSessionObject(
      sessionId,
      'test.user@company.com',
      'Test Research Topic',
      'Test: Test Research Topic',
      testReport
    );
    await delay(500);
    log('green', '✓ Session object created\n');

    // Summary
    log('cyan', '\n=== Test Completed Successfully ===\n');
    log('green', `Session ID: ${sessionId}`);
    log('green', 'All session events created: ✓');
    log('green', 'Final session object created: ✓\n');

    log('yellow', 'Next steps:');
    log('reset', '1. Check Foundry Ontology for Session Event objects');
    log('reset', '2. Check Foundry Ontology for Session object');
    log('reset', '3. Verify session ID links events to session\n');

    log('cyan', 'To query the created objects, use the OSDK:');
    log('reset', `
import { Session, SessionEvent } from "@gmahler-deep-research-service-user/sdk";
import { client } from "./client";

// Get all events for this session
const events = await client(SessionEvent)
  .where({ sessionId: { $eq: "${sessionId}" } })
  .fetchPage({ $orderBy: { createdAt: "asc" } });

// Get the session object
const session = await client(Session).fetchOne("${sessionId}");
`);

  } catch (error) {
    log('red', '\n=== Test Failed ===\n');
    log('red', `Error: ${error instanceof Error ? error.message : String(error)}`);
    
    if (error instanceof Error && error.stack) {
      log('yellow', '\nStack trace:');
      log('reset', error.stack);
    }

    log('yellow', '\nTroubleshooting:');
    log('reset', '1. Check FOUNDRY_BASE_URL and FOUNDRY_TOKEN are set');
    log('reset', '2. Verify @gmahler-deep-research-service-user/sdk is installed');
    log('reset', '3. Check network connectivity to Foundry');
    log('reset', '4. Verify user has permissions to create Session/SessionEvent objects\n');

    process.exit(1);
  }
}

// Run the test
testSessionTracking().catch(error => {
  log('red', `Unexpected error: ${error}`);
  process.exit(1);
});
