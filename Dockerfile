# Deep Research AI Agent - Palantir Foundry Compute Module Dockerfile
#
# This Dockerfile packages the Next.js application for deployment as a
# Foundry Compute Module using the Server Integration (OpenAPI Label) method.

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies using npm
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user with UID 5000 (required by Foundry)
RUN addgroup --system --gid 5000 foundry && \
    adduser --system --uid 5000 --ingroup foundry foundry

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Change ownership to foundry user
RUN chown -R foundry:foundry /app

# Switch to non-root user (required by Foundry)
USER 5000

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# OpenAPI Label for Foundry Server Integration
# This label contains the minified OpenAPI specification that Foundry uses
# to discover and register the API endpoints as functions.
LABEL server.openapi='{"openapi":"3.0.0","info":{"title":"Deep Research AI Agent API","description":"API for conducting comprehensive research using AI agents with dual-source search (Web + Ontology)","version":"1.0.0"},"servers":[{"url":"http://localhost:3000","description":"Local development server"}],"paths":{"/api/generate-questions":{"post":{"operationId":"generateQuestions","summary":"Generate clarifying questions for a research topic","description":"Given a research topic, generates 2-4 clarifying questions to help narrow down the research scope and identify specific aspects of interest.","requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"topic":{"type":"string","description":"The research topic to generate questions for"}},"required":["topic"]}}}},"responses":{"200":{"description":"Successfully generated clarifying questions","content":{"application/json":{"schema":{"type":"array","items":{"type":"string"},"description":"Array of clarifying questions"}}}},"500":{"description":"Error generating questions","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ErrorResponse"}}}}}}},"/api/foundry/research":{"post":{"operationId":"runDeepResearch","summary":"Run deep research on a topic","description":"Executes comprehensive research on the given topic using AI agents. Searches both internal Ontology data and external web sources, then generates a detailed markdown report.","requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"topic":{"type":"string","description":"The research topic or question to investigate"},"clarifications":{"type":"array","items":{"type":"object","properties":{"question":{"type":"string","description":"The clarifying question"},"answer":{"type":"string","description":"The user'\''s answer to the question"}},"required":["question","answer"]},"description":"Array of clarification question-answer pairs"}},"required":["topic"]}}}},"responses":{"200":{"description":"Research completed successfully","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ResearchResponse"}}}},"400":{"description":"Invalid request parameters","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ResearchResponse"}}}},"500":{"description":"Internal server error","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ResearchResponse"}}}}}}}},"components":{"schemas":{"ErrorResponse":{"type":"object","properties":{"success":{"type":"boolean","example":false},"error":{"type":"string","description":"Error message"}},"required":["success","error"]},"Activity":{"type":"object","properties":{"type":{"type":"string","enum":["search","extract","analyze","generate","planning"],"description":"Type of activity"},"status":{"type":"string","enum":["pending","complete","warning","error"],"description":"Status of the activity"},"message":{"type":"string","description":"Human-readable message about the activity"},"timestamp":{"type":"integer","description":"Unix timestamp in milliseconds"},"completedSteps":{"type":"integer","description":"Number of completed steps so far"},"tokenUsed":{"type":"integer","description":"Total tokens used so far"}},"required":["type","status","message","timestamp","completedSteps","tokenUsed"]},"ResearchResponse":{"type":"object","properties":{"success":{"type":"boolean","description":"Whether the research completed successfully"},"report":{"type":"string","nullable":true,"description":"The final research report in markdown format"},"activities":{"type":"array","items":{"$ref":"#/components/schemas/Activity"},"description":"List of activities performed during research"},"error":{"type":"string","description":"Error message if research failed"},"tokenUsed":{"type":"integer","description":"Total tokens consumed during research"},"completedSteps":{"type":"integer","description":"Total number of steps completed"}},"required":["success","report","activities"]}}}}'

CMD ["node", "server.js"]
