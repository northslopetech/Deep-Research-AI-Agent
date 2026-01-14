/**
 * Async Research Endpoint - Returns immediately with session ID
 * 
 * This route provides an asynchronous API for Foundry Compute Module integration.
 * Unlike the synchronous /api/foundry/research endpoint, this returns immediately
 * with a session ID while the research runs in the background.
 * 
 * Track progress by querying SessionEvent objects filtered by sessionId.
 * 
 * OpenAPI operationId: runDeepResearchAsync
 */

import { NextResponse } from 'next/server';
import { deepResearch } from '../../../deep-research/main';
import { ResearchState } from '../../../deep-research/types';
import { createBufferStream } from '../../../deep-research/adapter';
import { generateSessionId, SessionEvents } from '../../../deep-research/session-tracker';
import { ensureAuthenticated } from '@/lib/foundry-provider';
import { resolveFoundryUserAsync } from '@/lib/foundry-user';

interface Clarification {
  question: string;
  answer: string;
}

interface RequestBody {
  topic: string;
  clarifications?: Clarification[];
}

interface ResponseBody {
  success: boolean;
  sessionId: string;
  error?: string;
}

export async function POST(req: Request): Promise<NextResponse<ResponseBody>> {
  try {
    // Parse request body
    const body: RequestBody = await req.json();
    const { topic, clarifications = [] } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { success: false, sessionId: '', error: 'Missing or invalid "topic" field' },
        { status: 400 }
      );
    }

    console.log('[foundry/research/async] Received async research request for topic:', topic);

    // Ensure we have a valid auth token (important for Compute Module mode)
    await ensureAuthenticated();

    // Generate session ID upfront - this is returned to the caller immediately
    const sessionId = generateSessionId();
    const currentUser = await resolveFoundryUserAsync(req) || 'anonymous';

    console.log(`[foundry/research/async] Generated session ID: ${sessionId}`);
    console.log(`[foundry/research/async] Current user: ${currentUser}`);

    // Create initial STARTED event synchronously (must complete before returning)
    try {
      await SessionEvents.started(sessionId, topic);
      console.log(`[foundry/research/async] Created STARTED event for session: ${sessionId}`);
    } catch (eventError) {
      console.error(`[foundry/research/async] Failed to create STARTED event:`, eventError);
      // Continue anyway - the research can still proceed
    }

    // Build research state with pre-assigned sessionId
    const researchState: ResearchState = {
      topic,
      completedSteps: 0,
      tokenUsed: 0,
      findings: [],
      processedUrl: new Set(),
      clerificationsText: JSON.stringify(clarifications),
      currentUser,
      sessionId,              // Pre-assigned
      skipStartedEvent: true, // Don't create duplicate STARTED event in deepResearch
    };

    // Fire-and-forget: kick off research in background using setImmediate
    // This allows the HTTP response to return immediately while research continues
    setImmediate(async () => {
      console.log(`[foundry/research/async] Background research starting. Session: ${sessionId}`);
      try {
        // Use a buffer stream since no client is listening for streaming output
        const bufferStream = createBufferStream();
        await deepResearch(researchState, bufferStream);
        console.log(`[foundry/research/async] Background research completed successfully. Session: ${sessionId}`);
      } catch (error) {
        console.error(`[foundry/research/async] Background research failed. Session: ${sessionId}`, error);
        // Create a FAILED session event so the caller can detect the failure
        try {
          await SessionEvents.failed(sessionId, error instanceof Error ? error.message : String(error));
        } catch (eventError) {
          console.error(`[foundry/research/async] Failed to create FAILED event:`, eventError);
        }
      }
    });

    // Return immediately with session ID
    console.log(`[foundry/research/async] Returning immediately with session ID: ${sessionId}`);
    return NextResponse.json({ success: true, sessionId });

  } catch (error) {
    console.error('[foundry/research/async] Error:', error);
    return NextResponse.json(
      { success: false, sessionId: '', error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
