# Foundry Compute Module Setup Guide

This guide explains how to deploy the Deep Research AI Agent as a Palantir Foundry Compute Module using the Server Integration (OpenAPI Label) method.

## Overview

The application runs as a Next.js server inside Foundry. Two API endpoints are exposed as Foundry Functions:

1. **`generateQuestions`** (`POST /api/generate-questions`)
   - Input: `{ topic: string }`
   - Output: `string[]` (array of clarifying questions)

2. **`runDeepResearch`** (`POST /api/foundry/research`)
   - Input: `{ topic: string, clarifications?: Array<{question, answer}> }`
   - Output: `{ success, report, activities, tokenUsed, completedSteps }`

## Prerequisites

- Docker installed locally for building the image
- Access to a Palantir Foundry enrollment
- A Foundry Container Registry configured
- A Service User with appropriate permissions

## Build & Push Docker Image

```bash
# Build the Docker image
docker build -t deep-research-agent .

# Tag for Foundry Container Registry
docker tag deep-research-agent <your-foundry-registry>/deep-research-agent:latest

# Push to Foundry Container Registry
docker push <your-foundry-registry>/deep-research-agent:latest
```

## Foundry Configuration

### 1. Create Compute Module

1. Navigate to **Compute Modules** in Foundry
2. Click **Create new module**
3. Select **Server Integration**
4. Point to your pushed Docker image

### 2. Execution Mode

Select **Functions** with **Application Permissions** execution mode.

This enables the module to:
- Receive CLIENT_ID and CLIENT_SECRET for OAuth authentication
- Run with Service User permissions
- Be invoked as Foundry Functions

### 3. Environment Variables

Configure the following environment variables in Foundry:

| Variable | Required | Description |
|----------|----------|-------------|
| `FOUNDRY_BASE_URL` | Yes | Your Foundry enrollment URL (e.g., `https://your-org.palantirfoundry.com`) |
| `FOUNDRY_ONTOLOGY_RID` | Optional | RID of the ontology for internal search |
| `FOUNDRY_ONTOLOGY_API_NAME` | Optional | API name for ontology queries |
| `FOUNDRY_WEB_SEARCH_FUNCTION_NAME` | Optional | Function name for web search (default: `searchWebBatch`) |

**Note**: `CLIENT_ID` and `CLIENT_SECRET` are automatically injected by Foundry when using Application Permissions mode. Do **not** set these manually.

### 4. Service User Permissions

Ensure the Service User has:
- Access to the Ontology (if using ontology search)
- Permission to invoke the web search function
- Access to the LLM models (GPT_5, etc.)

## Local Development

For local development, use the static `FOUNDRY_TOKEN` approach:

```bash
# .env.local
FOUNDRY_TOKEN=your-personal-api-token
FOUNDRY_BASE_URL=https://your-org.palantirfoundry.com
FOUNDRY_ONTOLOGY_RID=ri.ontology.main.ontology.xxxxxxxx
```

Run the development server:

```bash
npm run dev
```

Test the synchronous endpoint:

```bash
curl -X POST http://localhost:3000/api/foundry/research \
  -H "Content-Type: application/json" \
  -d '{"topic": "What is machine learning?"}'
```

## API Reference

### Generate Questions

```bash
POST /api/generate-questions
Content-Type: application/json

{
  "topic": "Your research topic"
}
```

Response:
```json
["Question 1?", "Question 2?", "Question 3?"]
```

### Run Deep Research

```bash
POST /api/foundry/research
Content-Type: application/json

{
  "topic": "Your research topic",
  "clarifications": [
    {
      "question": "What specific aspect interests you?",
      "answer": "I want to focus on practical applications"
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "report": "# Research Report\n\n## Executive Summary\n...",
  "activities": [
    {
      "type": "planning",
      "status": "complete",
      "message": "Generated 3 search queries",
      "timestamp": 1702520194000,
      "completedSteps": 1,
      "tokenUsed": 150
    }
  ],
  "tokenUsed": 5000,
  "completedSteps": 15
}
```

## Troubleshooting

### Authentication Errors

If you see authentication errors:

1. **In Foundry**: Ensure execution mode is set to "Functions" with "Application Permissions"
2. **Locally**: Verify `FOUNDRY_TOKEN` is set in `.env.local`

### Ontology Search Not Working

1. Verify `FOUNDRY_ONTOLOGY_RID` is set correctly
2. Check Service User has access to the ontology
3. Test with `npm run test:ontology`

### Container Startup Issues

1. Check logs in Foundry Compute Module dashboard
2. Verify port 3000 is exposed and accessible
3. Ensure the OpenAPI label is correctly formatted in the Docker image

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Foundry Compute Module               │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │             Next.js Server (port 3000)          │   │
│  │                                                 │   │
│  │  /api/generate-questions  ─► generateQuestions  │   │
│  │  /api/foundry/research    ─► runDeepResearch    │   │
│  │  /api/deep-research       ─► (streaming, UI)    │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
│                          ▼                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │              foundry-auth.ts                     │   │
│  │  (OAuth via CLIENT_ID/CLIENT_SECRET)            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Foundry Platform    │
              │  - LLM Service        │
              │  - Ontology API       │
              │  - Web Search Fn      │
              └───────────────────────┘
```
