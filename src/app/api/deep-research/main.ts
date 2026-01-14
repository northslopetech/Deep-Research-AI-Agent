/* eslint-disable @typescript-eslint/no-explicit-any */
import { createActivityTracker } from "./activity-tracker";
import { MAX_ITERATIONS } from "./constants";
import { analyzeFindings, generateReport, generateSearchQueries, processSearchResults, search } from "./research-functions";
import { ResearchState } from "./types";
import { 
  generateSessionId, 
  createSessionObject, 
  SessionEvents 
} from "./session-tracker";

// Logging helper with timestamps
function log(stage: string, message: string, data?: unknown) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [RESEARCH:${stage}]`;
    if (data !== undefined) {
        console.log(`${prefix} ${message}`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
    } else {
        console.log(`${prefix} ${message}`);
    }
}

export async function deepResearch(researchState: ResearchState, dataStream: any){
    const startTime = Date.now();
    log('INIT', '========== DEEP RESEARCH STARTED ==========');
    log('INIT', `Topic: "${researchState.topic}"`);
    log('INIT', `Clarifications: ${researchState.clerificationsText}`);
    log('INIT', `Object Types Filter: ${researchState.objectTypes?.join(', ') || 'none (auto-discover)'}`);
    log('INIT', `Max iterations: ${MAX_ITERATIONS}`);

    // Generate unique session ID for tracking (use existing if pre-assigned)
    if (!researchState.sessionId) {
        researchState.sessionId = generateSessionId();
        researchState.currentUser = researchState.currentUser || 'system'; // Default user if not provided
    }
    log('INIT', `Session ID: ${researchState.sessionId}`);
    log('INIT', `Current User: ${researchState.currentUser}`);

    // Create initial Session Event - Research Started (unless already created externally)
    if (!researchState.skipStartedEvent) {
        try {
            await SessionEvents.started(researchState.sessionId, researchState.topic);
        } catch (error) {
            log('INIT', `⚠️ Failed to create initial session event (continuing anyway): ${error}`);
        }
    } else {
        log('INIT', 'Skipping STARTED event (already created externally)');
    }

    let iteration = 0;

    const activityTracker = createActivityTracker(dataStream, researchState);

    log('PLANNING', 'Generating initial search queries...');
    const planningStart = Date.now();
    const initialQueries = await generateSearchQueries(researchState, activityTracker)
    log('PLANNING', `Planning completed in ${Date.now() - planningStart}ms`);
    log('PLANNING', 'Initial queries:', (initialQueries as any).searchQueries);

    // Create Session Event - Planning Completed
    try {
        await SessionEvents.planningCompleted(
            researchState.sessionId!,
            (initialQueries as any).searchQueries?.length || 0
        );
    } catch (error) {
        log('PLANNING', `⚠️ Failed to create planning event: ${error}`);
    }

    let currentQueries = (initialQueries as any).searchQueries

    while(currentQueries && currentQueries.length > 0 && iteration <= MAX_ITERATIONS){
        iteration++;
        const iterationStart = Date.now();

        log('ITERATION', `========== ITERATION ${iteration}/${MAX_ITERATIONS} ==========`);
        log('ITERATION', `Queries to execute: ${currentQueries.length}`);
        currentQueries.forEach((q: { query: string; source: string }, i: number) => {
            log('ITERATION', `  [${i + 1}] ${q.source.toUpperCase()}: "${q.query}"`);
        });

        // Create Session Event - Iteration Started
        try {
            await SessionEvents.iterationStarted(
                researchState.sessionId!,
                iteration,
                currentQueries.length
            );
        } catch (error) {
            log('ITERATION', `⚠️ Failed to create iteration started event: ${error}`);
        }

        // Execute searches
        log('SEARCH', `Executing ${currentQueries.length} parallel searches...`);
        const searchStart = Date.now();
        const searchResults = currentQueries.map((item: { query: string; source: "web" | "ontology" }) =>
          search(item.query, item.source, researchState, activityTracker)
        );
        const searchResultsResponses = await Promise.allSettled(searchResults)
        log('SEARCH', `All searches completed in ${Date.now() - searchStart}ms`);

        // Log individual search results
        searchResultsResponses.forEach((result, i) => {
            const query = currentQueries[i];
            if (result.status === 'fulfilled') {
                log('SEARCH', `  [${i + 1}] ${query.source.toUpperCase()} "${query.query.substring(0, 40)}..." - SUCCESS (${result.value?.length || 0} results)`);
            } else {
                log('SEARCH', `  [${i + 1}] ${query.source.toUpperCase()} "${query.query.substring(0, 40)}..." - FAILED: ${result.reason}`);
            }
        });

        const allSearchResults = searchResultsResponses.filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled' && result.value.length > 0).map(result => result.value).flat()

        log('SEARCH', `Total search results to process: ${allSearchResults.length}`);

        // Create Session Event - Search Completed
        try {
            await SessionEvents.searchCompleted(
                researchState.sessionId!,
                iteration,
                allSearchResults.length
            );
        } catch (error) {
            log('SEARCH', `⚠️ Failed to create search completed event: ${error}`);
        }

        // Process/Extract content
        log('EXTRACT', `Processing ${allSearchResults.length} search results...`);
        const extractStart = Date.now();
        const newFindings = await processSearchResults(
            allSearchResults, researchState, activityTracker
        )
        log('EXTRACT', `Extraction completed in ${Date.now() - extractStart}ms`);
        log('EXTRACT', `New findings extracted: ${newFindings.length}`);

        researchState.findings = [...researchState.findings, ...newFindings]
        log('EXTRACT', `Total findings accumulated: ${researchState.findings.length}`);

        // Create Session Event - Extraction Completed
        try {
            await SessionEvents.extractionCompleted(
                researchState.sessionId!,
                iteration,
                newFindings.length
            );
        } catch (error) {
            log('EXTRACT', `⚠️ Failed to create extraction completed event: ${error}`);
        }

        // Analyze findings
        log('ANALYZE', 'Analyzing findings to determine if more research needed...');
        const analyzeStart = Date.now();
        const analysis = await analyzeFindings(
            researchState,
            currentQueries,
            iteration,
            activityTracker
        )
        log('ANALYZE', `Analysis completed in ${Date.now() - analyzeStart}ms`);
        log('ANALYZE', `Sufficient: ${(analysis as any).sufficient}`);
        log('ANALYZE', `Gaps identified: ${(analysis as any).gaps?.length || 0}`);
        if ((analysis as any).gaps?.length > 0) {
            log('ANALYZE', 'Gaps:', (analysis as any).gaps);
        }
        log('ANALYZE', `Follow-up queries suggested: ${(analysis as any).queries?.length || 0}`);

        // Create Session Event - Analysis Completed
        try {
            await SessionEvents.analysisCompleted(
                researchState.sessionId!,
                iteration,
                (analysis as any).sufficient,
                (analysis as any).gaps?.length || 0
            );
        } catch (error) {
            log('ANALYZE', `⚠️ Failed to create analysis completed event: ${error}`);
        }

        if((analysis as any).sufficient){
            log('ANALYZE', 'Content is SUFFICIENT - exiting research loop');
            break;
        }

        // Filter out duplicate queries
        const previousQueryCount = ((analysis as any).queries || []).length;
        currentQueries = ((analysis as any).queries || []).filter(
          (item: { query: string; source: string }) =>
            !currentQueries.some((existing: { query: string }) => existing.query === item.query)
        );
        log('ITERATION', `Iteration ${iteration} completed in ${Date.now() - iterationStart}ms`);
        log('ITERATION', `Next iteration queries: ${currentQueries.length} (filtered ${previousQueryCount - currentQueries.length} duplicates)`);
        log('ITERATION', `Tokens used so far: ${researchState.tokenUsed}`);
        log('ITERATION', `Steps completed: ${researchState.completedSteps}`);
    }

    log('LOOP_END', `========== RESEARCH LOOP COMPLETED ==========`);
    log('LOOP_END', `Total iterations: ${iteration}`);
    log('LOOP_END', `Total findings: ${researchState.findings.length}`);
    log('LOOP_END', `Total tokens used: ${researchState.tokenUsed}`);

    // Create Session Event - Research Loop Completed
    try {
        await SessionEvents.loopCompleted(
            researchState.sessionId!,
            iteration,
            researchState.findings.length
        );
    } catch (error) {
        log('LOOP_END', `⚠️ Failed to create loop completed event: ${error}`);
    }

    // Generate report
    log('REPORT', 'Generating final report...');
    
    // Create Session Event - Report Generation Started
    try {
        await SessionEvents.reportStarted(researchState.sessionId!);
    } catch (error) {
        log('REPORT', `⚠️ Failed to create report started event: ${error}`);
    }
    
    const reportStart = Date.now();
    const report = await generateReport(researchState, activityTracker);
    log('REPORT', `Report generated in ${Date.now() - reportStart}ms`);
    log('REPORT', `Report length: ${typeof report === 'string' ? report.length : 'N/A'} characters`);

    // Create Session Event - Report Generation Completed
    try {
        await SessionEvents.reportCompleted(
            researchState.sessionId!,
            typeof report === 'string' ? report.length : 0
        );
    } catch (error) {
        log('REPORT', `⚠️ Failed to create report completed event: ${error}`);
    }

    dataStream.writeData({
        type: "report",
        content: report
    })

    const totalTime = Date.now() - startTime;
    log('COMPLETE', '========== DEEP RESEARCH COMPLETED ==========');
    log('COMPLETE', `Total execution time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
    log('COMPLETE', `Final stats: ${researchState.completedSteps} steps, ${researchState.tokenUsed} tokens, ${researchState.findings.length} findings`);

    // Create Session Event - Session Completed
    try {
        await SessionEvents.completed(
            researchState.sessionId!,
            totalTime,
            researchState.tokenUsed
        );
    } catch (error) {
        log('COMPLETE', `⚠️ Failed to create session completed event: ${error}`);
    }

    // Create final Session object with the complete report
    try {
        const title = `Research: ${researchState.topic.substring(0, 100)}${researchState.topic.length > 100 ? '...' : ''}`;
        await createSessionObject(
            researchState.sessionId!,
            researchState.currentUser || 'system',
            researchState.topic,
            title,
            typeof report === 'string' ? report : JSON.stringify(report)
        );
    } catch (error) {
        log('COMPLETE', `⚠️ Failed to create final session object: ${error}`);
    }

    return initialQueries;

}