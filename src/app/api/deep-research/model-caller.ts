/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateText, tool } from "ai";
import { foundry } from "@/lib/foundry-provider";
import { zodToJsonSchema } from "@/lib/zod-to-json-schema";
import { ActivityTracker, ModelCallOptions, ResearchState } from "./types";
import { MAX_RETRY_ATTEMPTS, RETRY_DELAY_MS } from "./constants";
import { delay } from "./utils";

// Logging helper with timestamps
function log(message: string, data?: unknown) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [MODEL]`;
    if (data !== undefined) {
        console.log(`${prefix} ${message}`, typeof data === 'object' ? JSON.stringify(data, null, 2).substring(0, 500) : data);
    } else {
        console.log(`${prefix} ${message}`);
    }
}

// Type assertion needed due to AI SDK LanguageModelV1 vs V2 mismatch
const getModel = (modelId: string) => foundry(modelId) as any;

export async function callModel<T>({
  model,
  prompt,
  system,
  schema,
  activityType = "generate",
}: ModelCallOptions<T>,
researchState: ResearchState,
activityTracker: ActivityTracker): Promise<T | string> {

  let attempts = 0;
  let lastError: Error | null = null;

  const callStart = Date.now();
  const hasSchema = !!schema;
  log(`Starting model call: ${activityType} (model: ${model}, structured: ${hasSchema})`);
  log(`Prompt preview: "${prompt.substring(0, 150)}..."`);

  while (attempts < MAX_RETRY_ATTEMPTS) {
    const attemptStart = Date.now();
    attempts++;
    log(`Attempt ${attempts}/${MAX_RETRY_ATTEMPTS}...`);

    try {
      if (schema) {
        // Structured output via forced tool call (Foundry doesn't support generateObject)
        const jsonSchema = zodToJsonSchema(schema);

        log(`Calling Foundry LLM with tool (submit_result)...`);

        // Use the exact pattern from sdk-validation that works (AI SDK v5)
        const result = await generateText({
          model: getModel(model),
          prompt,
          system: system + "\n\nIMPORTANT: You must respond ONLY by calling the 'submit_result' tool with your answer.",
          tools: {
            submit_result: tool({
              description: "Submit the final structured result",
              inputSchema: schema as any,  // AI SDK v5: parameters -> inputSchema (cast for generic compatibility)
              providerOptions: {
                foundry: { parameters: jsonSchema },
              },
              // Execute is required for the SDK to properly detect and send tools
              execute: async (args) => args,
            }),
          },
          maxOutputTokens: 8000,  // AI SDK v5: maxTokens -> maxOutputTokens
        });

        // Get result from tool calls - check both .args and .input (AI SDK v5 compatibility)
        const toolCall = result.toolCalls?.[0];
        if (!toolCall) {
          log(`ERROR: Model did not call submit_result tool`);
          throw new Error("Model failed to call submit_result tool");
        }

        // AI SDK v5 uses .input
        const toolArgs = toolCall.input;

        if (!toolArgs) {
          log(`ERROR: No arguments in tool call`);
          throw new Error("No arguments in tool call");
        }

        const tokensUsed = result.usage?.totalTokens || 0;
        researchState.tokenUsed += tokensUsed;
        researchState.completedSteps++;

        log(`SUCCESS (${Date.now() - attemptStart}ms) - Tokens: ${tokensUsed}, Total tokens: ${researchState.tokenUsed}`);
        log(`Tool result preview:`, toolArgs);

        return toolArgs as T;
      } else {
        // Text generation - straightforward
        log(`Calling Foundry LLM for text generation...`);

        const result = await generateText({
          model: getModel(model),
          prompt,
          system,
          maxOutputTokens: 8000,  // AI SDK v5: maxTokens -> maxOutputTokens
        });

        const tokensUsed = result.usage?.totalTokens || 0;
        researchState.tokenUsed += tokensUsed;
        researchState.completedSteps++;

        log(`SUCCESS (${Date.now() - attemptStart}ms) - Tokens: ${tokensUsed}, Total tokens: ${researchState.tokenUsed}`);
        log(`Text result length: ${result.text.length} characters`);

        return result.text;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
      log(`FAILED attempt ${attempts}: ${lastError.message}`);

      if (attempts < MAX_RETRY_ATTEMPTS) {
        const retryDelay = RETRY_DELAY_MS * attempts;
        log(`Retrying in ${retryDelay}ms...`);
        activityTracker.add(
          activityType,
          "warning",
          `Model call failed, attempt ${attempts}/${MAX_RETRY_ATTEMPTS}. Retrying...`
        );
        await delay(retryDelay);
      }
    }
  }

  log(`FATAL: All ${MAX_RETRY_ATTEMPTS} attempts failed after ${Date.now() - callStart}ms`);
  throw lastError || new Error(`Failed after ${MAX_RETRY_ATTEMPTS} attempts!`);
}
