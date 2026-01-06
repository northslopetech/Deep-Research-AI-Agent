/**
 * Foundry Compute Module - Synchronous Research Endpoint
 *
 * This route provides a standard JSON API for Foundry Server Integration.
 * Unlike the streaming /api/deep-research endpoint, this returns a complete
 * response with the final report and all activities as a single JSON object.
 *
 * OpenAPI operationId: runDeepResearch
 */

import { NextResponse } from 'next/server';
import { deepResearch } from '../../deep-research/main';
import { ResearchState } from '../../deep-research/types';
import { createBufferStream, ActivityContent } from '../../deep-research/adapter';
import { ensureAuthenticated } from '@/lib/foundry-provider';

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
  report: string | null;
  activities: ActivityContent[];
  error?: string;
  tokenUsed?: number;
  completedSteps?: number;
}

export async function POST(req: Request): Promise<NextResponse<ResponseBody>> {
  try {
    // Parse request body
    const body: RequestBody = await req.json();

    const { topic, clarifications = [] } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        {
          success: false,
          report: null,
          activities: [],
          error: 'Missing or invalid "topic" field',
        },
        { status: 400 }
      );
    }

    console.log('[foundry/research] Starting synchronous research for topic:', topic);

    // Ensure we have a valid auth token (important for Compute Module mode)
    await ensureAuthenticated();

    // Create a buffer stream to capture all output
    const bufferStream = createBufferStream();

    // Build research state
    const researchState: ResearchState = {
      topic,
      completedSteps: 0,
      tokenUsed: 0,
      findings: [],
      processedUrl: new Set(),
      clerificationsText: JSON.stringify(clarifications),
    };

    // Run the research synchronously (will buffer instead of stream)
    await deepResearch(researchState, bufferStream);

    // Extract results from buffer
    const report = bufferStream.getReport();
    const activities = bufferStream.getActivities();

    console.log('[foundry/research] Research completed. Report length:', report?.length || 0);

    return NextResponse.json({
      success: true,
      report,
      activities,
      tokenUsed: researchState.tokenUsed,
      completedSteps: researchState.completedSteps,
    });

  } catch (error) {
    console.error('[foundry/research] Error:', error);

    return NextResponse.json(
      {
        success: false,
        report: null,
        activities: [],
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
