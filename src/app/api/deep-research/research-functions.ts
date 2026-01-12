/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ActivityTracker,
  ResearchFindings,
  ResearchState,
  SearchResult,
} from "./types";
import { z } from "zod";
import {
  ANALYSIS_SYSTEM_PROMPT,
  EXTRACTION_SYSTEM_PROMPT,
  getAnalysisPrompt,
  getExtractionPrompt,
  getPlanningPrompt,
  getReportPrompt,
  PLANNING_SYSTEM_PROMPT,
  REPORT_SYSTEM_PROMPT,
} from "./prompts";
import { callModel } from "./model-caller";
import { webSearch, ontologySearch } from "./foundry-tools";
import { combineFindings, handleError } from "./utils";
import { MAX_ITERATIONS, MODELS } from "./constants";

// Logging helper with timestamps
function log(stage: string, message: string, data?: unknown) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [FUNC:${stage}]`;
    if (data !== undefined) {
        const dataStr = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
        console.log(`${prefix} ${message}`, dataStr.substring(0, 500) + (dataStr.length > 500 ? '...' : ''));
    } else {
        console.log(`${prefix} ${message}`);
    }
}

export async function generateSearchQueries(
  researchState: ResearchState,
  activityTracker: ActivityTracker
) {
  log('PLANNING', `Starting query generation for topic: "${researchState.topic}"`);
  log('PLANNING', `Using model: ${MODELS.PLANNING}`);

  try{
    activityTracker.add("planning","pending","Planning the research");

  const result = await callModel(
    {
      model: MODELS.PLANNING,
      prompt: getPlanningPrompt(
        researchState.topic,
        researchState.clerificationsText
      ),
      system: PLANNING_SYSTEM_PROMPT,
      schema: z.object({
        searchQueries: z
          .array(
            z.object({
              query: z.string().describe("The search query text"),
              source: z.enum(["web", "ontology"]).describe("Which search tool to use: 'web' for external internet search, 'ontology' for internal company data"),
            })
          )
          .describe(
            "Array of search queries with their designated source. Generate 2-5 queries using a mix of both sources. (max 5 queries)"
          ),
      }),
      activityType: "planning"
    },
    researchState, activityTracker
  );

  log('PLANNING', `Generated ${(result as any).searchQueries?.length || 0} queries`);
  activityTracker.add("planning", "complete", "Crafted the research plan");

  return result;
  }catch(error){
    log('PLANNING', `ERROR: ${error instanceof Error ? error.message : String(error)}`);
    // If planning fails completely, use minimal fallback
    return handleError(error, `Research planning`, activityTracker, "planning", {
        searchQueries: [
          { query: researchState.topic, source: "web" }
        ]
    })

  }
}

export async function search(
  query: string,
  source: "web" | "ontology",
  researchState: ResearchState,
  activityTracker: ActivityTracker
): Promise<SearchResult[]> {
  const sourceLabel = source === "web" ? "Web" : "Ontology";
  const startTime = Date.now();
  log('SEARCH', `[${sourceLabel}] Starting search for: "${query}"`);

  activityTracker.add("search", "pending", `Searching ${sourceLabel} for ${query}`);

  try {
    let content: string;
    let title: string;
    let url: string;

    if (source === "web") {
      log('SEARCH', `[${sourceLabel}] Calling webSearch...`);
      content = await webSearch(query);
      title = "Web Results";
      url = "Firecrawl";
    } else {
      // Pass objectTypes from ResearchState to filter ontology search
      log('SEARCH', `[${sourceLabel}] Calling ontologySearch (types: ${researchState.objectTypes?.join(', ') || 'auto'})...`);
      content = await ontologySearch(query, researchState.objectTypes);
      title = "Ontology Results";
      url = "Foundry";
    }

    researchState.completedSteps++;
    log('SEARCH', `[${sourceLabel}] Completed in ${Date.now() - startTime}ms - Content length: ${content.length} chars`);

    activityTracker.add("search", "complete", `Found ${sourceLabel} results for ${query}`);

    return [{ title, url, content }];
  } catch (error) {
    log('SEARCH', `[${sourceLabel}] ERROR: ${error instanceof Error ? error.message : String(error)}`);
    return handleError(error, `Searching ${sourceLabel} for ${query}`, activityTracker, "search", []) || [];
  }
}

export async function extractContent(
  content: string,
  url: string,
  researchState: ResearchState,
  activityTracker: ActivityTracker
) {
    const startTime = Date.now();
    log('EXTRACT', `Starting extraction from ${url} (content length: ${content.length} chars)`);

    try{
        activityTracker.add("extract","pending",`Extracting content from ${url}`);

        const result = await callModel(
          {
            model: MODELS.EXTRACTION,
            prompt: getExtractionPrompt(
              content,
              researchState.topic,
              researchState.clerificationsText
            ),
            system: EXTRACTION_SYSTEM_PROMPT,
            schema: z.object({
              summary: z.string().describe("A comprehensive summary of the content"),
            }),
            activityType: "extract"
          },
          researchState, activityTracker
        );

        const summaryLength = (result as any).summary?.length || 0;
        log('EXTRACT', `Completed in ${Date.now() - startTime}ms - Summary: ${summaryLength} chars`);
        activityTracker.add("extract","complete",`Extracted content from ${url}`);

        return {
          url,
          summary: (result as any).summary,
        };
    }catch(error){
        log('EXTRACT', `ERROR: ${error instanceof Error ? error.message : String(error)}`);
        return handleError(error, `Content extraction from ${url}`, activityTracker, "extract", null) || null
    }
}

export async function processSearchResults(
  searchResults: SearchResult[],
  researchState: ResearchState,
  activityTracker: ActivityTracker
): Promise<ResearchFindings[]> {
  const startTime = Date.now();
  log('PROCESS', `Processing ${searchResults.length} search results...`);

  const extractionPromises = searchResults.map((result) =>
    extractContent(result.content, result.url, researchState, activityTracker)
  );
  const extractionResults = await Promise.allSettled(extractionPromises);

  // Log individual extraction results
  extractionResults.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value) {
      log('PROCESS', `  [${i + 1}] ${searchResults[i].url} - SUCCESS`);
    } else if (result.status === 'rejected') {
      log('PROCESS', `  [${i + 1}] ${searchResults[i].url} - FAILED: ${result.reason}`);
    } else {
      log('PROCESS', `  [${i + 1}] ${searchResults[i].url} - NULL result`);
    }
  });

  type ExtractionResult = { url: string; summary: string };

  const newFindings = extractionResults
    .filter(
      (result): result is PromiseFulfilledResult<ExtractionResult> =>
        result.status === "fulfilled" &&
        result.value !== null &&
        result.value !== undefined
    )
    .map((result) => {
      const { summary, url } = result.value;
      return {
        summary,
        source: url,
      };
    });

  log('PROCESS', `Completed in ${Date.now() - startTime}ms - ${newFindings.length}/${searchResults.length} successful extractions`);
  return newFindings;
}

export async function analyzeFindings(
  researchState: ResearchState,
  currentQueries: string[],
  currentIteration: number,
  activityTracker: ActivityTracker
) {
  const startTime = Date.now();
  log('ANALYZE', `Starting analysis (iteration ${currentIteration}/${MAX_ITERATIONS})`);
  log('ANALYZE', `Total findings to analyze: ${researchState.findings.length}`);

  try {
    activityTracker.add("analyze","pending",`Analyzing research findings (iteration ${currentIteration}) of ${MAX_ITERATIONS}`);
    const contentText = combineFindings(researchState.findings);
    log('ANALYZE', `Combined findings text length: ${contentText.length} chars`);

    const result = await callModel(
      {
        model: MODELS.ANALYSIS,
        prompt: getAnalysisPrompt(
          contentText,
          researchState.topic,
          researchState.clerificationsText,
          currentQueries,
          currentIteration,
          MAX_ITERATIONS,
          contentText.length
        ),
        system: ANALYSIS_SYSTEM_PROMPT,
        schema: z.object({
          sufficient: z
            .boolean()
            .describe(
              "Whether the collected content is sufficient for a useful report"
            ),
          gaps: z.array(z.string()).describe("Identified gaps in the content"),
          queries: z
            .array(
              z.object({
                query: z.string().describe("The search query text"),
                source: z.enum(["web", "ontology"]).describe("Which search tool to use"),
              })
            )
            .describe(
              "Search queries for missing information with designated source. Max 5 queries."
            ),
        }),
        activityType: "analyze"
      },
      researchState, activityTracker
    );

    const isContentSufficient = typeof result !== 'string' && result.sufficient;
    log('ANALYZE', `Completed in ${Date.now() - startTime}ms`);
    log('ANALYZE', `Result: sufficient=${isContentSufficient}, gaps=${(result as any).gaps?.length || 0}, follow-up queries=${(result as any).queries?.length || 0}`);

    activityTracker.add("analyze","complete",`Analyzed collected research findings: ${isContentSufficient ? 'Content is sufficient' : 'More research is needed!'}`);

    return result;
  } catch (error) {
    log('ANALYZE', `ERROR: ${error instanceof Error ? error.message : String(error)}`);
    return handleError(error, `Content analysis`, activityTracker, "analyze", {
        sufficient: false,
        gaps: ["Unable to analyze content"],
        queries: [{ query: "Please try a different search query", source: "web" }]
    })
  }
}

export async function generateReport(researchState: ResearchState, activityTracker: ActivityTracker) {
  const startTime = Date.now();
  log('REPORT', `========== REPORT GENERATION START ==========`);
  log('REPORT', `Total findings: ${researchState.findings.length}`);
  log('REPORT', `Topic: "${researchState.topic}"`);

  try {
    activityTracker.add("generate","pending",`Generating comprehensive report!`);

    const contentText = combineFindings(researchState.findings);
    log('REPORT', `Combined content length: ${contentText.length} chars`);
    log('REPORT', `Using model: ${MODELS.REPORT}`);

    const report = await callModel(
      {
        model: MODELS.REPORT,
        prompt: getReportPrompt(
          contentText,
          researchState.topic,
          researchState.clerificationsText
        ),
        system: REPORT_SYSTEM_PROMPT,
        activityType: "generate"
      },
      researchState, activityTracker
    );

    const reportLength = typeof report === 'string' ? report.length : 0;
    log('REPORT', `========== REPORT GENERATION COMPLETE ==========`);
    log('REPORT', `Generated in ${Date.now() - startTime}ms`);
    log('REPORT', `Report length: ${reportLength} chars`);
    log('REPORT', `Total tokens used: ${researchState.tokenUsed}`);
    log('REPORT', `Total steps: ${researchState.completedSteps}`);

    activityTracker.add("generate","complete",`Generated comprehensive report, Total tokens used: ${researchState.tokenUsed}. Research completed in ${researchState.completedSteps} steps.`);

    return report;
  } catch (error) {
    log('REPORT', `ERROR: ${error instanceof Error ? error.message : String(error)}`);
    return handleError(error, `Report Generation`, activityTracker, "generate", "Error generating report. Please try again. ")
  }
}
