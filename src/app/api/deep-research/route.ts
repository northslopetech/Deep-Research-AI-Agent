import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { ResearchState } from "./types";
import { deepResearch } from "./main";
import { resolveFoundryUserAsync } from "@/lib/foundry-user";

/* eslint-disable @typescript-eslint/no-explicit-any */
function extractTextFromMessage(message: any): string | undefined {
  // AI SDK v5 UIMessage shape typically uses `parts`
  if (typeof message?.content === "string") return message.content;

  const parts = message?.parts;
  if (Array.isArray(parts)) {
    const text = parts
      .filter((p: any) => p?.type === "text" && typeof p?.text === "string")
      .map((p: any) => p.text)
      .join("");
    return text.length > 0 ? text : undefined;
  }

  // Fallbacks for other possible shapes
  if (typeof message?.text === "string") return message.text;
  return undefined;
}

// AI SDK v5: DataStream writer wrapper that provides v4-compatible interface
function createDataStreamWriter(writer: any) {
  return {
    writeData: (data: unknown) => {
      writer.write({ type: "data", value: [data] });
    }
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[deep-research] Received body:", JSON.stringify(body).substring(0, 200));

    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("[deep-research] Invalid messages format");
      return new Response(
        JSON.stringify({ success: false, error: "Invalid messages format" }),
        { status: 400 }
      );
    }

    const lastMessageText = extractTextFromMessage(messages[messages.length - 1]);
    console.log("[deep-research] Last message text:", lastMessageText?.substring?.(0, 100));

    if (!lastMessageText) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Last message had no text content. Expected messages[].content (string) or messages[].parts (text part).",
        }),
        { status: 400 }
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(lastMessageText);
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Last message text was not valid JSON. Expected JSON like {\"topic\":\"...\",\"clarifications\":[...]}",
        }),
        { status: 400 }
      );
    }

    const topic = parsed.topic;
    const clarifications = parsed.clarifications || parsed.clerifications; // handle both spellings
    const objectTypes = parsed.objectTypes as string[] | undefined; // Optional array of object type API names
    const providedUser = parsed.currentUser as string | undefined; // Optional user identifier
    const resolvedUser = await resolveFoundryUserAsync(req);
    const currentUser = providedUser || resolvedUser;

    console.log("[deep-research] Starting research for topic:", topic);
    if (objectTypes && objectTypes.length > 0) {
      console.log("[deep-research] Filtering ontology search to object types:", objectTypes);
    }
    if (currentUser) {
      console.log("[deep-research] Current user:", currentUser);
    }

    // AI SDK v5: createDataStreamResponse -> createUIMessageStream + createUIMessageStreamResponse
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        console.log("[deep-research] Execute started");
        // Create a wrapper to maintain v4-compatible interface for existing code
        const dataStream = createDataStreamWriter(writer);

        const researchState: ResearchState = {
            topic: topic,
            completedSteps: 0,
            tokenUsed: 0,
            findings: [],
            processedUrl: new Set(),
            clerificationsText: JSON.stringify(clarifications),
            objectTypes: objectTypes, // Array of object type API names for ontology search
            currentUser: currentUser || 'anonymous' // User performing research (for Session tracking)
        }

        try {
          await deepResearch(researchState, dataStream);
          console.log("[deep-research] Execute completed successfully");
        } catch (err) {
          console.error("[deep-research] Execute error:", err);
          
          // Track failed session if we have a session ID
          if (researchState.sessionId) {
            try {
              const { SessionEvents } = await import('./session-tracker');
              await SessionEvents.failed(
                researchState.sessionId,
                err instanceof Error ? err.message : String(err)
              );
            } catch (sessionError) {
              console.error("[deep-research] Failed to track session failure:", sessionError);
            }
          }
          
          throw err;
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error("[deep-research] Route error:", error);

    return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message: "Invalid message format!"
        }),
        { status: 500 }
      );

  }
}
