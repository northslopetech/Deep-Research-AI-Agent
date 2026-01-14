# Deep Research AI Agent - Palantir Foundry Compute Module Dockerfile
#
# This Dockerfile packages the Next.js application for deployment as a
# Foundry Compute Module using the Server Integration (OpenAPI Label) method.

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files AND .npmrc for private registry access
COPY package.json pnpm-lock.yaml* .npmrc ./

# Install dependencies using pnpm with Foundry token for private packages
RUN --mount=type=secret,id=FOUNDRY_TOKEN \
    export FOUNDRY_TOKEN=$(cat /run/secrets/FOUNDRY_TOKEN 2>/dev/null || echo "") && \
    pnpm install --frozen-lockfile || pnpm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js application
# Remove .npmrc during build to avoid token substitution warnings (dependencies already installed)
ENV NEXT_TELEMETRY_DISABLED=1
RUN rm -f .npmrc && pnpm run build

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
LABEL server.openapi='{"openapi":"3.0.0","info":{"title":"Deep Research AI Agent API","description":"API for conducting comprehensive research using AI agents","version":"1.0.0"},"paths":{"/api/generate-questions":{"post":{"operationId":"generateQuestions","summary":"Generate clarifying questions for a research topic","requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"topic":{"type":"string","description":"The research topic to generate questions for"}},"required":["topic"]}}}},"responses":{"200":{"description":"Successfully generated clarifying questions","content":{"application/json":{"schema":{"type":"array","items":{"type":"string"}}}}}}}},"/api/foundry/research":{"post":{"operationId":"runDeepResearch","summary":"Run deep research on a topic","requestBody":{"required":true,"content":{"application/json":{"schema":{"type":"object","properties":{"topic":{"type":"string","description":"The research topic or question to investigate"},"clarifications":{"type":"array","items":{"type":"object","properties":{"question":{"type":"string"},"answer":{"type":"string"}},"required":["question","answer"]}}},"required":["topic"]}}}},"responses":{"200":{"description":"Research completed successfully","content":{"application/json":{"schema":{"type":"object","properties":{"success":{"type":"boolean"},"report":{"type":"string","nullable":true},"activities":{"type":"array","items":{"type":"object","properties":{"type":{"type":"string"},"status":{"type":"string"},"message":{"type":"string"},"timestamp":{"type":"integer"}}}},"error":{"type":"string","nullable":true}},"required":["success"]}}}}}}}},"servers":[{"url":"http://localhost:3000"}]}'

CMD ["node", "server.js"]
