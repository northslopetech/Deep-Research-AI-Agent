/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { generateText, tool } from "ai";
import { getFoundryProvider } from "@/lib/foundry-provider";
import { z } from "zod";

// Simple logger that won't be stripped in production
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [generate-questions] ${message}`;
  if (data !== undefined) {
    console.info(logMessage, JSON.stringify(data, null, 2));
  } else {
    console.info(logMessage);
  }
};

const questionsSchema = z.object({
  questions: z.array(z.string()),
});

const questionsJsonSchema = {
  type: "object" as const,
  properties: {
    questions: {
      type: "array" as const,
      items: { type: "string" as const },
    },
  },
  required: ["questions"],
};

const clarifyResearchGoals = async (topic: string) => {
  log("clarifyResearchGoals called", { topic });

  const prompt = `Given the research topic "${topic}", generate 2-4 clarifying questions to help narrow down the research scope. Focus on identifying:
- Specific aspects of interest
- Required depth/complexity level
- Any particular perspective or excluded sources

IMPORTANT: You must respond ONLY by calling the 'submit_result' tool with your answer.`;

  try {
    log("Getting Foundry provider...");
    const foundry = await getFoundryProvider();
    log("Foundry provider obtained");

    const model = foundry("GPT_4o") as any;
    log("Model created: GPT_4o");

    log("Calling generateText...");
    const result = await generateText({
      model,
      prompt,
      tools: {
        submit_result: tool({
          description: "Submit the generated clarifying questions",
          inputSchema: questionsSchema as any, // AI SDK v5: parameters -> inputSchema
          providerOptions: {
            foundry: { parameters: questionsJsonSchema },
          },
          execute: async (args) => {
            log("Tool execute called", args);
            return args;
          },
        }),
      },
      maxOutputTokens: 4000, // AI SDK v5: maxTokens -> maxOutputTokens
    });

    log("generateText completed", {
      hasToolCalls: !!result.toolCalls?.length,
      toolCallCount: result.toolCalls?.length || 0,
      text: result.text?.substring(0, 200),
    });

    const toolCall = result.toolCalls?.[0];
    if (toolCall) {
      // AI SDK v5 uses .input instead of .args
      const toolArgs = toolCall.input as { questions?: string[] };
      log("Tool call found", { toolName: toolCall.toolName, args: toolArgs });
      const questions = toolArgs?.questions || [];
      log("Extracted questions", { count: questions.length, questions });
      return questions;
    }

    log("No tool call in response");
    return [];
  } catch (error: any) {
    log("ERROR in clarifyResearchGoals", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    throw error; // Re-throw to be caught by POST handler
  }
};

export async function POST(req: Request) {
  log("POST request received");

  try {
    const body = await req.json();
    log("Request body parsed", body);

    const { topic } = body;
    if (!topic) {
      log("ERROR: No topic provided");
      return NextResponse.json(
        { success: false, error: "Topic is required" },
        { status: 400 }
      );
    }

    log("Starting clarifyResearchGoals", { topic });
    const questions = await clarifyResearchGoals(topic);
    log("clarifyResearchGoals completed", { questionCount: questions.length });

    return NextResponse.json(questions);
  } catch (error: any) {
    log("ERROR in POST handler", {
      message: error?.message,
      stack: error?.stack,
    });
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate questions" },
      { status: 500 }
    );
  }
}
