/**
 * Session Tracker
 * 
 * Handles creation of Session and Session Event objects in Foundry Ontology
 * to track the progress of deep research sessions.
 * 
 * Session Events are created at important milestones throughout the research process.
 * The final Session object is created at the end with the complete research report.
 */

import { createClient } from '@osdk/client';
import { 
  deepResearchCreateDeepResearchSessionWithIdAction,
  createSessionEvent 
} from '@gmahler-deep-research-service-user/sdk';
import { randomUUID } from 'crypto';
import { getAuthToken } from '@/lib/foundry-auth';
import { getOntologyRid } from '@/lib/foundry-client';

// Initialize OSDK client with Foundry configuration
async function getOSDKClient() {
  const foundryUrl = process.env.FOUNDRY_BASE_URL;
  const ontologyRid = await getOntologyRid();
  
  if (!foundryUrl) {
    throw new Error('FOUNDRY_BASE_URL must be set for session tracking');
  }

  if (!ontologyRid) {
    throw new Error('FOUNDRY_ONTOLOGY_RID must be set for session tracking');
  }

  // Get authentication token
  const token = await getAuthToken();
  
  // Create OSDK client with proper configuration
  return createClient(
    foundryUrl,
    ontologyRid,
    async () => token,
    {
      // Optional: add additional configuration here
    }
  );
}

// Logging helper with session context
function sessionLog(sessionId: string, stage: string, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [SESSION:${sessionId.slice(0, 8)}] [${stage}]`;
  if (data !== undefined) {
    console.log(`${prefix} ${message}`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  // Generate a UUID for the session
  const id = randomUUID();
  sessionLog(id, 'INIT', `Generated new session ID: ${id}`);
  return id;
}

/**
 * Create a Session Event in the Foundry Ontology
 * 
 * Session Events track important milestones in the research process
 */
export async function createSessionEventObject(
  sessionId: string,
  status: string,
  message: string,
  error: boolean = false
): Promise<void> {
  try {
    sessionLog(sessionId, 'EVENT', `Creating session event - Status: ${status}, Error: ${error}`);
    sessionLog(sessionId, 'EVENT', `Message: ${message}`);
    
    const client = await getOSDKClient();
    const createdAt = new Date().toISOString();
    
    const result = await client(createSessionEvent).applyAction(
      {
        sessionId: sessionId,
        createdAt: createdAt,
        status: status,
        error: error,
        message: message,
      },
      {
        $returnEdits: true,
      }
    );
    
    if (result.type === 'edits') {
      sessionLog(sessionId, 'EVENT', `✅ Session event created successfully`);
      if (result.editedObjectTypes && result.editedObjectTypes.length > 0) {
        sessionLog(sessionId, 'EVENT', `Event object created:`, result.editedObjectTypes[0]);
      }
    } else {
      sessionLog(sessionId, 'EVENT', `⚠️ Session event creation returned unexpected result type: ${result.type}`);
    }
  } catch (error) {
    sessionLog(sessionId, 'EVENT', `❌ Failed to create session event: ${error instanceof Error ? error.message : String(error)}`);
    // Don't throw - we don't want to fail the research if session tracking fails
    console.error('Session event creation error details:', error);
  }
}

/**
 * Create the final Session object in the Foundry Ontology
 * 
 * This is called at the end of the research process with the complete report
 */
export async function createSessionObject(
  sessionId: string,
  currentUser: string,
  query: string,
  title: string,
  report: string
): Promise<void> {
  try {
    sessionLog(sessionId, 'SESSION', `Creating final session object`);
    sessionLog(sessionId, 'SESSION', `Query: "${query}"`);
    sessionLog(sessionId, 'SESSION', `Title: "${title}"`);
    sessionLog(sessionId, 'SESSION', `Report length: ${report.length} characters`);
    
    const client = await getOSDKClient();
    
    const result = await client(deepResearchCreateDeepResearchSessionWithIdAction).applyAction(
      {
        id: sessionId,
        currentUser: currentUser,
        query: query,
        title: title,
        report: report,
      },
      {
        $returnEdits: true,
      }
    );
    
    if (result.type === 'edits') {
      sessionLog(sessionId, 'SESSION', `✅ Session object created successfully`);
      if (result.editedObjectTypes && result.editedObjectTypes.length > 0) {
        sessionLog(sessionId, 'SESSION', `Session object created:`, result.editedObjectTypes[0]);
      }
    } else {
      sessionLog(sessionId, 'SESSION', `⚠️ Session creation returned unexpected result type: ${result.type}`);
    }
  } catch (error) {
    sessionLog(sessionId, 'SESSION', `❌ Failed to create session object: ${error instanceof Error ? error.message : String(error)}`);
    // Don't throw - we don't want to fail the research if session tracking fails
    console.error('Session creation error details:', error);
  }
}

/**
 * Session event helper functions for common milestones
 */
export const SessionEvents = {
  /**
   * Research session started
   */
  started: (sessionId: string, topic: string) => 
    createSessionEventObject(
      sessionId,
      'STARTED',
      `Research session started for topic: "${topic}"`,
      false
    ),
  
  /**
   * Planning phase completed
   */
  planningCompleted: (sessionId: string, queryCount: number) =>
    createSessionEventObject(
      sessionId,
      'PLANNING_COMPLETE',
      `Planning completed - Generated ${queryCount} initial queries`,
      false
    ),
  
  /**
   * Iteration started
   */
  iterationStarted: (sessionId: string, iteration: number, queryCount: number) =>
    createSessionEventObject(
      sessionId,
      'ITERATION_STARTED',
      `Iteration ${iteration} started - Executing ${queryCount} queries`,
      false
    ),
  
  /**
   * Search completed
   */
  searchCompleted: (sessionId: string, iteration: number, resultCount: number) =>
    createSessionEventObject(
      sessionId,
      'SEARCH_COMPLETE',
      `Iteration ${iteration} - Search completed with ${resultCount} results`,
      false
    ),
  
  /**
   * Extraction completed
   */
  extractionCompleted: (sessionId: string, iteration: number, findingsCount: number) =>
    createSessionEventObject(
      sessionId,
      'EXTRACTION_COMPLETE',
      `Iteration ${iteration} - Extracted ${findingsCount} findings`,
      false
    ),
  
  /**
   * Analysis completed
   */
  analysisCompleted: (sessionId: string, iteration: number, sufficient: boolean, gapCount: number) =>
    createSessionEventObject(
      sessionId,
      'ANALYSIS_COMPLETE',
      `Iteration ${iteration} - Analysis complete. Sufficient: ${sufficient}, Gaps: ${gapCount}`,
      false
    ),
  
  /**
   * Research loop completed
   */
  loopCompleted: (sessionId: string, iterations: number, findingsCount: number) =>
    createSessionEventObject(
      sessionId,
      'LOOP_COMPLETE',
      `Research loop completed after ${iterations} iterations with ${findingsCount} total findings`,
      false
    ),
  
  /**
   * Report generation started
   */
  reportStarted: (sessionId: string) =>
    createSessionEventObject(
      sessionId,
      'REPORT_STARTED',
      'Generating final research report',
      false
    ),
  
  /**
   * Report generation completed
   */
  reportCompleted: (sessionId: string, reportLength: number) =>
    createSessionEventObject(
      sessionId,
      'REPORT_COMPLETE',
      `Report generation completed - ${reportLength} characters`,
      false
    ),
  
  /**
   * Session completed successfully
   */
  completed: (sessionId: string, totalTime: number, tokenCount: number) =>
    createSessionEventObject(
      sessionId,
      'COMPLETED',
      `Research session completed in ${(totalTime / 1000).toFixed(2)}s using ${tokenCount} tokens`,
      false
    ),
  
  /**
   * Session failed with error
   */
  failed: (sessionId: string, errorMessage: string) =>
    createSessionEventObject(
      sessionId,
      'FAILED',
      `Research session failed: ${errorMessage}`,
      true
    ),
};
