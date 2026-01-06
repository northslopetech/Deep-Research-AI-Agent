This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
docs/
  SEARCH_STRATEGY.md
public/
  background.jpg
  file.svg
  globe.svg
  next.svg
  vercel.svg
  window.svg
scripts/
  debug-schema.ts
  test-api.ts
  test-foundry-direct.ts
  test-foundry-websearch.ts
  test-ontology-query.ts
src/
  app/
    api/
      deep-research/
        activity-tracker.ts
        constants.ts
        foundry-tools.ts
        main.ts
        model-caller.ts
        prompts.ts
        research-functions.ts
        route.ts
        services.ts
        types.ts
        utils.ts
      generate-questions/
        route.ts
    favicon.ico
    globals.css
    layout.tsx
    page.tsx
  components/
    ui/
      deep-research/
        CompletedQuestions.tsx
        QnA.tsx
        QuestionForm.tsx
        ResearchActivities.tsx
        ResearchReport.tsx
        ResearchTimer.tsx
        UserInput.tsx
      accordion.tsx
      button.tsx
      card.tsx
      collapsible.tsx
      form.tsx
      input.tsx
      label.tsx
      progress.tsx
      radio-group.tsx
      select.tsx
      skeleton.tsx
      sonner.tsx
      tabs.tsx
      textarea.tsx
      tooltip.tsx
  lib/
    foundry-client.ts
    foundry-provider.ts
    utils.ts
    zod-to-json-schema.ts
  store/
    deepResearch.ts
.env.example
.envrc.example
.gitignore
.npmrc
CLAUDE.md
components.json
eslint.config.mjs
next.config.ts
package.json
postcss.config.mjs
README.md
tsconfig.json
```

# Files

## File: docs/SEARCH_STRATEGY.md
````markdown
# Deep Research Agent: Search Strategy Guide

This document explains how the research agent has been trained to use the ontology query tool iteratively and effectively.

## Overview

The research agent searches **TWO sources simultaneously** with every query:
- **Web Search (External)**: Public internet via Firecrawl
- **Ontology Search (Internal)**: Company data via Foundry Ontology API

## Agent Training: What the Prompts Teach

### Phase 1: Planning (`PLANNING_SYSTEM_PROMPT`)

**What the agent learns:**

✅ Both sources exist and will be queried together
✅ How to craft queries that work well for both sources
✅ When to use company-specific terminology vs general terms
✅ Examples of good vs bad queries

**Example Training:**
```
Bad: "data" (too vague, low signal)
Good: "customer analytics dashboard implementation" (specific, works for both)
Good: "employee onboarding process documentation" (likely internal data)
Good: "TypeScript best practices 2025" (likely external data)
```

### Phase 2: Extraction (`EXTRACTION_SYSTEM_PROMPT`)

**What the agent learns:**

✅ Ontology results are structured JSON (not web text)
✅ How to interpret: query, totalCount, searchedTypes, results[], RIDs, properties
✅ How to extract entity information from structured data
✅ How to format ontology findings for later analysis

**Example Ontology Result the Agent Sees:**
```json
{
  "query": "project alpha",
  "totalCount": 2,
  "searchedTypes": ["T6Resource", "KeyPeople"],
  "results": [
    {
      "rid": "ri.ontology.main.object.abc123",
      "properties": {
        "resourceId": "res-001",
        "name": "Project Alpha",
        "owner": "Alice Smith",
        "status": "Active"
      }
    }
  ]
}
```

**What the Agent Extracts:**
```markdown
## Internal Data: Project Alpha

Searched Types: T6Resource, KeyPeople
Found: 2 entities

**T6Resource: Project Alpha**
- Resource ID: res-001
- Owner: Alice Smith
- Status: Active
- RID: ri.ontology.main.object.abc123
```

### Phase 3: Analysis (`ANALYSIS_SYSTEM_PROMPT`)

**What the agent learns:**

✅ How to identify if data was found (totalCount > 0)
✅ What searchedTypes reveals (what object types exist)
✅ When to create follow-up queries
✅ How to use discovered entities in new searches

**Iterative Search Decision Tree:**

```
Did we find entities? (totalCount > 0)
├─ YES → Extract property values → Use in follow-up queries
│         Example: Found "Alice Smith" → Search "Alice Smith projects"
│
└─ NO → Check searchedTypes
    ├─ Relevant types exist? → Try different terms
    │   Example: searchedTypes shows "KeyPeople" but got 0 results
    │   → Try "engineer" instead of "developer"
    │
    └─ No relevant types? → Topic likely external-only
        → Focus on web results
```

**When to Search Again:**

1. **Discovered Relevant Entities**
   ```
   Found: Project Alpha (owner: Alice Smith, status: Active)
   Follow-up: "Alice Smith projects", "Project Alpha status report"
   ```

2. **Found Object Types But No Matches**
   ```
   searchedTypes: ["KeyPeople"]
   totalCount: 0
   Follow-up: Try synonyms like "employee", "staff", "team member"
   ```

3. **Missing Critical Information**
   ```
   Web: General best practices
   Ontology: No results
   Follow-up: Try company-specific terms, internal project names
   ```

### Phase 4: Report Generation (`REPORT_SYSTEM_PROMPT`)

**What the agent learns:**

✅ Clearly separate internal vs external information
✅ Create dedicated sections for company-specific data
✅ Preserve RIDs and entity details for traceability
✅ Handle missing internal data gracefully

**Report Structure:**
```markdown
# Topic Overview
General knowledge and external best practices...

## Company-Specific Implementation
### Internal Resources Found
- **Project Alpha** (RID: ri.ontology.main.object.abc123)
  - Owner: Alice Smith
  - Status: Active
  ...

## External Best Practices
Information from public sources...

## Internal Resources
- T6Resource: Project Alpha (ri.ontology.main.object.abc123)
- KeyPeople: Alice Smith (ri.ontology.main.object.def456)
```

## Real-World Example: Research Flow

### User Query: "Tell me about our data analytics projects"

**Iteration 1: Initial Search**

Agent generates queries:
- "data analytics projects implementation"
- "analytics dashboard tools"
- "data visualization platforms"

Results:
- Web: General articles about analytics tools
- Ontology: Found 3 entities in T6Resource type with "analytics" in properties

**Iteration 2: Targeted Follow-up**

Agent extracts from Ontology:
- Project: "Customer Analytics Dashboard"
- Owner: "Bob Chen"
- Status: "In Progress"

Agent generates follow-up:
- "Customer Analytics Dashboard status"
- "Bob Chen analytics projects"

Results:
- Ontology: More details about the dashboard project
- Web: Best practices for customer analytics

**Iteration 3: Deep Dive**

Agent now knows specific project names and owners, generates:
- "Customer Analytics Dashboard architecture"
- "Bob Chen team members"

**Final Report:**

```markdown
# Data Analytics Projects at [Company]

## Overview
Data analytics involves... [general knowledge]

## Internal Analytics Projects

### Customer Analytics Dashboard
- **Status**: In Progress
- **Owner**: Bob Chen
- **RID**: ri.ontology.main.object.xyz789
- **Purpose**: Real-time customer behavior tracking
- **Technologies**: [from web research]

### Related Personnel
- **Bob Chen** - Project Lead
- **Team Members**: [if found in ontology]

## Industry Best Practices
[Information from web sources]

## Internal Resources
- T6Resource: Customer Analytics Dashboard
- KeyPeople: Bob Chen
```

## Key Success Factors

### ✅ Agent Understands:
1. Ontology results are structured (JSON), not text
2. Empty results (totalCount: 0) mean no matches, not an error
3. searchedTypes reveals what internal data categories exist
4. Entity properties can be used in follow-up searches
5. Both sources provide value - use them together

### ✅ Agent Avoids:
1. Treating empty Ontology results as failures
2. Ignoring searchedTypes information
3. Fabricating internal data when none exists
4. Generic follow-up queries when specific entities were found
5. Mixing up internal entity data with external knowledge

## Testing the Updated Prompts

To verify the agent uses the ontology correctly:

1. **Test with internal entities**: Research a topic with known internal data
2. **Watch for iteration**: Agent should create follow-up queries using discovered entities
3. **Check report**: Should clearly separate internal vs external information
4. **Verify RIDs**: Internal entities should include RIDs for traceability

Example test topics:
- "Our current projects" (likely finds internal data)
- "TypeScript best practices" (likely external only)
- "Employee Alice Smith's work" (if Alice exists in ontology)
````

## File: public/file.svg
````
<svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" clip-rule="evenodd" fill="#666" fill-rule="evenodd"/></svg>
````

## File: public/globe.svg
````
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g clip-path="url(#a)"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.27 14.1a6.5 6.5 0 0 0 3.67-3.45q-1.24.21-2.7.34-.31 1.83-.97 3.1M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.48-1.52a7 7 0 0 1-.96 0H7.5a4 4 0 0 1-.84-1.32q-.38-.89-.63-2.08a40 40 0 0 0 3.92 0q-.25 1.2-.63 2.08a4 4 0 0 1-.84 1.31zm2.94-4.76q1.66-.15 2.95-.43a7 7 0 0 0 0-2.58q-1.3-.27-2.95-.43a18 18 0 0 1 0 3.44m-1.27-3.54a17 17 0 0 1 0 3.64 39 39 0 0 1-4.3 0 17 17 0 0 1 0-3.64 39 39 0 0 1 4.3 0m1.1-1.17q1.45.13 2.69.34a6.5 6.5 0 0 0-3.67-3.44q.65 1.26.98 3.1M8.48 1.5l.01.02q.41.37.84 1.31.38.89.63 2.08a40 40 0 0 0-3.92 0q.25-1.2.63-2.08a4 4 0 0 1 .85-1.32 7 7 0 0 1 .96 0m-2.75.4a6.5 6.5 0 0 0-3.67 3.44 29 29 0 0 1 2.7-.34q.31-1.83.97-3.1M4.58 6.28q-1.66.16-2.95.43a7 7 0 0 0 0 2.58q1.3.27 2.95.43a18 18 0 0 1 0-3.44m.17 4.71q-1.45-.12-2.69-.34a6.5 6.5 0 0 0 3.67 3.44q-.65-1.27-.98-3.1" fill="#666"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>
````

## File: public/next.svg
````
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 394 80"><path fill="#000" d="M262 0h68.5v12.7h-27.2v66.6h-13.6V12.7H262V0ZM149 0v12.7H94v20.4h44.3v12.6H94v21h55v12.6H80.5V0h68.7zm34.3 0h-17.8l63.8 79.4h17.9l-32-39.7 32-39.6h-17.9l-23 28.6-23-28.6zm18.3 56.7-9-11-27.1 33.7h17.8l18.3-22.7z"/><path fill="#000" d="M81 79.3 17 0H0v79.3h13.6V17l50.2 62.3H81Zm252.6-.4c-1 0-1.8-.4-2.5-1s-1.1-1.6-1.1-2.6.3-1.8 1-2.5 1.6-1 2.6-1 1.8.3 2.5 1a3.4 3.4 0 0 1 .6 4.3 3.7 3.7 0 0 1-3 1.8zm23.2-33.5h6v23.3c0 2.1-.4 4-1.3 5.5a9.1 9.1 0 0 1-3.8 3.5c-1.6.8-3.5 1.3-5.7 1.3-2 0-3.7-.4-5.3-1s-2.8-1.8-3.7-3.2c-.9-1.3-1.4-3-1.4-5h6c.1.8.3 1.6.7 2.2s1 1.2 1.6 1.5c.7.4 1.5.5 2.4.5 1 0 1.8-.2 2.4-.6a4 4 0 0 0 1.6-1.8c.3-.8.5-1.8.5-3V45.5zm30.9 9.1a4.4 4.4 0 0 0-2-3.3 7.5 7.5 0 0 0-4.3-1.1c-1.3 0-2.4.2-3.3.5-.9.4-1.6 1-2 1.6a3.5 3.5 0 0 0-.3 4c.3.5.7.9 1.3 1.2l1.8 1 2 .5 3.2.8c1.3.3 2.5.7 3.7 1.2a13 13 0 0 1 3.2 1.8 8.1 8.1 0 0 1 3 6.5c0 2-.5 3.7-1.5 5.1a10 10 0 0 1-4.4 3.5c-1.8.8-4.1 1.2-6.8 1.2-2.6 0-4.9-.4-6.8-1.2-2-.8-3.4-2-4.5-3.5a10 10 0 0 1-1.7-5.6h6a5 5 0 0 0 3.5 4.6c1 .4 2.2.6 3.4.6 1.3 0 2.5-.2 3.5-.6 1-.4 1.8-1 2.4-1.7a4 4 0 0 0 .8-2.4c0-.9-.2-1.6-.7-2.2a11 11 0 0 0-2.1-1.4l-3.2-1-3.8-1c-2.8-.7-5-1.7-6.6-3.2a7.2 7.2 0 0 1-2.4-5.7 8 8 0 0 1 1.7-5 10 10 0 0 1 4.3-3.5c2-.8 4-1.2 6.4-1.2 2.3 0 4.4.4 6.2 1.2 1.8.8 3.2 2 4.3 3.4 1 1.4 1.5 3 1.5 5h-5.8z"/></svg>
````

## File: public/vercel.svg
````
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1155 1000"><path d="m577.3 0 577.4 1000H0z" fill="#fff"/></svg>
````

## File: public/window.svg
````
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm3.75 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" fill="#666"/></svg>
````

## File: scripts/debug-schema.ts
````typescript
/**
 * Debug script to inspect object type schemas
 */

import { getObjectTypeSchema, listObjectTypes } from '../src/lib/foundry-client';

const FOUNDRY_ONTOLOGY_RID = process.env.FOUNDRY_ONTOLOGY_RID;

if (!FOUNDRY_ONTOLOGY_RID) {
  console.error('❌ FOUNDRY_ONTOLOGY_RID not set!');
  process.exit(1);
}

async function main() {
  console.log('🔍 Inspecting Object Type Schemas\n');

  // Get first few object types
  const types = await listObjectTypes(FOUNDRY_ONTOLOGY_RID);
  console.log(`Found ${types.length} object types\n`);

  // Inspect first 3 types in detail
  for (const type of types.slice(0, 3)) {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Object Type: ${type}`);
      console.log('='.repeat(60));

      const schema = await getObjectTypeSchema(type, FOUNDRY_ONTOLOGY_RID);

      console.log('\nFull Schema:', JSON.stringify(schema, null, 2));

      if (schema.properties) {
        console.log('\n📋 Properties:');
        for (const [propName, propDef] of Object.entries(schema.properties)) {
          console.log(`  - ${propName}:`, JSON.stringify(propDef, null, 2));
        }
      } else {
        console.log('\n⚠️  No properties found in schema');
      }
    } catch (error) {
      console.error(`\n❌ Error getting schema for ${type}:`, error);
    }
  }
}

main().catch(console.error);
````

## File: scripts/test-foundry-direct.ts
````typescript
/**
 * Direct Foundry Provider Test
 *
 * Tests the Foundry provider directly without going through Next.js
 * Using the exact pattern from sdk-validation that works.
 *
 * Usage: npx tsx scripts/test-foundry-direct.ts
 * Debug: DEBUG_FOUNDRY=1 npx tsx scripts/test-foundry-direct.ts
 */

import { generateText, tool } from 'ai';
import { createFoundry } from '@northslopetech/foundry-ai-sdk';
import { z } from 'zod';

// Check env vars
const FOUNDRY_TOKEN = process.env.FOUNDRY_TOKEN;
const FOUNDRY_BASE_URL = process.env.FOUNDRY_BASE_URL;

console.log('🔧 Environment Check');
console.log('─'.repeat(50));
console.log(`FOUNDRY_TOKEN: ${FOUNDRY_TOKEN ? '✓ Set (' + FOUNDRY_TOKEN.substring(0, 10) + '...)' : '❌ Missing'}`);
console.log(`FOUNDRY_BASE_URL: ${FOUNDRY_BASE_URL ? '✓ ' + FOUNDRY_BASE_URL : '❌ Missing'}`);

if (!FOUNDRY_TOKEN || !FOUNDRY_BASE_URL) {
  console.error('\n❌ Missing environment variables!');
  console.error('   Make sure .envrc is loaded (run: direnv allow)');
  process.exit(1);
}

const foundry = createFoundry({
  foundryToken: FOUNDRY_TOKEN,
  baseURL: FOUNDRY_BASE_URL,
});

async function testBasicTextGeneration() {
  console.log('\n📋 Test 1: Basic Text Generation');
  console.log('─'.repeat(50));

  try {
    console.log('  Sending request...');
    const startTime = Date.now();

    const result = await generateText({
      model: foundry('GPT_5') as any,
      prompt: 'Say "Hello from Foundry!" and nothing else.',
      maxOutputTokens: 4000,  // AI SDK v5: maxTokens -> maxOutputTokens
    });

    const elapsed = Date.now() - startTime;
    console.log(`  Response time: ${elapsed}ms`);
    console.log(`  Text: "${result.text}"`);
    console.log(`  Usage: ${JSON.stringify(result.usage)}`);

    if (result.text && result.text.length > 0) {
      console.log('\n  ✅ Basic text generation: PASSED');
      return true;
    } else {
      console.log('\n  ❌ Empty response');
      return false;
    }
  } catch (error) {
    console.error('\n  ❌ Test failed:', error);
    return false;
  }
}

async function testToolCall() {
  console.log('\n📋 Test 2: Tool Call (Structured Output)');
  console.log('─'.repeat(50));

  // JSON Schema for providerOptions (required workaround)
  const questionsJsonSchema = {
    type: 'object' as const,
    properties: {
      questions: {
        type: 'array' as const,
        items: { type: 'string' as const },
      },
    },
    required: ['questions'],
  };

  try {
    console.log('  Sending request with tool...');
    const startTime = Date.now();

    // Using exact pattern from sdk-validation that works (AI SDK v5)
    const result = await generateText({
      model: foundry('GPT_5') as any,
      prompt: `Generate 2 simple questions about TypeScript.

IMPORTANT: You must respond ONLY by calling the 'submit_result' tool with your answer.`,
      tools: {
        submit_result: tool({
          description: 'Submit the generated questions',
          inputSchema: z.object({  // AI SDK v5: parameters -> inputSchema
            questions: z.array(z.string()),
          }),
          providerOptions: {
            foundry: { parameters: questionsJsonSchema },
          },
          // Execute is required for proper tool detection
          execute: async (args) => args,
        }),
      },
      maxOutputTokens: 4000,  // AI SDK v5: maxTokens -> maxOutputTokens
    });

    const elapsed = Date.now() - startTime;
    console.log(`  Response time: ${elapsed}ms`);

    console.log('\n  Result details:');
    console.log('    Text:', result.text ? `"${result.text.substring(0, 100)}..."` : '(empty)');
    console.log('    Tool calls:', result.toolCalls?.length || 0);
    console.log('    Tool results:', result.toolResults?.length || 0);

    if (result.toolCalls && result.toolCalls.length > 0) {
      const toolCall = result.toolCalls[0];
      console.log('\n  Tool call details:');
      console.log('    Name:', toolCall.toolName);

      // Check both .args and .input for AI SDK v5 compatibility
      const args = (toolCall as any).input
        ? (typeof (toolCall as any).input === 'string'
          ? JSON.parse((toolCall as any).input)
          : (toolCall as any).input)
        : toolCall.args;

      console.log('    Args:', JSON.stringify(args, null, 2));

      if (args && args.questions && args.questions.length > 0) {
        console.log('\n  Generated questions:');
        args.questions.forEach((q: string, i: number) => {
          console.log(`    ${i + 1}. ${q}`);
        });
        console.log('\n  ✅ Tool call: PASSED');
        return true;
      }
    }

    // Check if model responded with text instead of tool call
    if (result.text && result.text.length > 0) {
      console.log('\n  ⚠️  Model responded with text instead of tool call:');
      console.log(`    "${result.text}"`);
    }

    console.log('\n  ❌ No tool call received');
    return false;
  } catch (error) {
    console.error('\n  ❌ Test failed:', error);
    return false;
  }
}

async function testWeatherTool() {
  console.log('\n📋 Test 3: Weather Tool (like sdk-validation)');
  console.log('─'.repeat(50));

  const weatherJsonSchema = {
    type: 'object' as const,
    properties: {
      location: { type: 'string' as const, description: 'City name' },
    },
    required: ['location'],
  };

  try {
    console.log('  Sending request...');
    const startTime = Date.now();

    const result = await generateText({
      model: foundry('GPT_5') as any,
      prompt: 'What is the weather in Tokyo?',
      tools: {
        get_weather: tool({
          description: 'Get weather for a location',
          inputSchema: z.object({ location: z.string() }),  // AI SDK v5: parameters -> inputSchema
          providerOptions: {
            foundry: { parameters: weatherJsonSchema },
          },
          execute: async ({ location }) => {
            console.log(`  🔧 Tool called: get_weather("${location}")`);
            return { location, temp: 22, conditions: 'Clear' };
          },
        }),
      },
      maxOutputTokens: 4000,  // AI SDK v5: maxTokens -> maxOutputTokens
    });

    const elapsed = Date.now() - startTime;
    console.log(`  Response time: ${elapsed}ms`);
    console.log('  Tool calls:', result.toolCalls?.length || 0);
    console.log('  Text response:', result.text?.substring(0, 100) || '(empty)');

    if (result.toolCalls && result.toolCalls.length > 0) {
      console.log('\n  ✅ Weather tool: PASSED');
      return true;
    }

    console.log('\n  ❌ No tool call');
    return false;
  } catch (error) {
    console.error('\n  ❌ Test failed:', error);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Direct Foundry Provider Test');
  console.log('═'.repeat(50));

  const results: boolean[] = [];

  results.push(await testBasicTextGeneration());
  results.push(await testToolCall());
  results.push(await testWeatherTool());

  console.log('\n' + '═'.repeat(50));
  console.log('📊 Summary');
  console.log('─'.repeat(50));

  const passed = results.filter(r => r).length;
  console.log(`Passed: ${passed}/${results.length}`);

  if (passed === results.length) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed - check output above');
  }
}

main().catch(console.error);
````

## File: scripts/test-ontology-query.ts
````typescript
/**
 * Ontology Query Test
 *
 * Tests the Foundry Ontology query functionality
 *
 * Usage: npx tsx scripts/test-ontology-query.ts
 */

import {
  searchOntologyObjects,
  queryOntologyByType,
  listObjectTypes,
} from '../src/lib/foundry-client';

// Check env vars
const FOUNDRY_TOKEN = process.env.FOUNDRY_TOKEN;
const FOUNDRY_BASE_URL = process.env.FOUNDRY_BASE_URL;
const FOUNDRY_ONTOLOGY_RID = process.env.FOUNDRY_ONTOLOGY_RID;

console.log('🔧 Environment Check');
console.log('─'.repeat(50));
console.log(
  `FOUNDRY_TOKEN: ${
    FOUNDRY_TOKEN ? '✓ Set (' + FOUNDRY_TOKEN.substring(0, 10) + '...)' : '❌ Missing'
  }`
);
console.log(`FOUNDRY_BASE_URL: ${FOUNDRY_BASE_URL ? '✓ ' + FOUNDRY_BASE_URL : '❌ Missing'}`);
console.log(
  `FOUNDRY_ONTOLOGY_RID: ${
    FOUNDRY_ONTOLOGY_RID ? '✓ ' + FOUNDRY_ONTOLOGY_RID : '❌ Missing'
  }`
);

if (!FOUNDRY_TOKEN || !FOUNDRY_BASE_URL) {
  console.error('\n❌ Missing environment variables!');
  console.error('   Make sure .envrc is loaded (run: direnv allow)');
  process.exit(1);
}

if (!FOUNDRY_ONTOLOGY_RID) {
  console.error('\n❌ FOUNDRY_ONTOLOGY_RID not set!');
  console.error('   Please set this in your .envrc file');
  console.error('   Format: export FOUNDRY_ONTOLOGY_RID=ri.ontology.main.ontology.xxxxxxxx');
  process.exit(1);
}

async function testListObjectTypes() {
  console.log('\n📋 Test 1: List Available Object Types');
  console.log('─'.repeat(50));

  try {
    console.log('  Fetching object types...');
    const startTime = Date.now();

    const objectTypes = await listObjectTypes(FOUNDRY_ONTOLOGY_RID);

    const elapsed = Date.now() - startTime;
    console.log(`  Response time: ${elapsed}ms`);
    console.log(`  Found ${objectTypes.length} object types`);

    if (objectTypes.length > 0) {
      console.log('\n  Available object types:');
      objectTypes.slice(0, 10).forEach((type, i) => {
        console.log(`    ${i + 1}. ${type}`);
      });
      if (objectTypes.length > 10) {
        console.log(`    ... and ${objectTypes.length - 10} more`);
      }
      console.log('\n  ✅ List object types: PASSED');
      return { passed: true, objectTypes };
    } else {
      console.log('\n  ⚠️  No object types found (empty ontology?)');
      return { passed: true, objectTypes: [] };
    }
  } catch (error) {
    console.error('\n  ❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('     Message:', error.message);
    }
    return { passed: false, objectTypes: [] };
  }
}

async function testSearchWithAutoDiscover(searchQuery: string) {
  console.log('\n📋 Test 2: Search with Auto-Discover (Multiple Types)');
  console.log('─'.repeat(50));
  console.log(`  Query: "${searchQuery}"`);

  try {
    console.log('  Searching ontology with auto-discover...');
    const startTime = Date.now();

    const response = await searchOntologyObjects(searchQuery, {
      ontologyRid: FOUNDRY_ONTOLOGY_RID,
      maxResults: 10,
      autoDiscover: true, // This will discover and search across types
    });

    const elapsed = Date.now() - startTime;
    console.log(`  Response time: ${elapsed}ms`);
    console.log(`  Types searched: ${response.searchedTypes?.length || 0}`);
    if (response.searchedTypes && response.searchedTypes.length > 0) {
      console.log(`    - ${response.searchedTypes.join(', ')}`);
    }
    console.log(`  Total matches: ${response.totalCount || 0}`);
    console.log(`  Results returned: ${response.data?.length || 0}`);

    if (response.data && response.data.length > 0) {
      console.log('\n  Results:');
      response.data.forEach((obj: any, i: number) => {
        console.log(`\n    ${i + 1}. RID: ${obj.rid}`);
        console.log(`       Properties:`, JSON.stringify(obj.properties, null, 8).substring(0, 200));
      });
      console.log('\n  ✅ Auto-discover search: PASSED');
      return true;
    } else {
      console.log('\n  ℹ️  No results found for this query');
      console.log('     Try a different search term');
      return true; // Not a failure, just no matches
    }
  } catch (error) {
    console.error('\n  ❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('     Message:', error.message);
    }
    return false;
  }
}

async function testQuerySpecificType(objectType: string, searchQuery: string) {
  console.log('\n📋 Test 3: Query Specific Object Type');
  console.log('─'.repeat(50));
  console.log(`  Object Type: "${objectType}"`);
  console.log(`  Query: "${searchQuery}"`);

  try {
    console.log('  Querying ontology...');
    const startTime = Date.now();

    const response = await queryOntologyByType(objectType, searchQuery, {
      ontologyRid: FOUNDRY_ONTOLOGY_RID,
      maxResults: 5,
    });

    const elapsed = Date.now() - startTime;
    console.log(`  Response time: ${elapsed}ms`);
    console.log(`  Total matches: ${response.totalCount || 0}`);
    console.log(`  Results returned: ${response.data?.length || 0}`);

    if (response.data && response.data.length > 0) {
      console.log('\n  Results:');
      response.data.forEach((obj: any, i: number) => {
        console.log(`\n    ${i + 1}. RID: ${obj.rid}`);
        console.log(`       Properties:`, JSON.stringify(obj.properties, null, 8).substring(0, 200));
      });
      console.log('\n  ✅ Query specific type: PASSED');
      return true;
    } else {
      console.log('\n  ℹ️  No results found for this type/query combination');
      return true;
    }
  } catch (error) {
    console.error('\n  ❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('     Message:', error.message);

      // Provide helpful guidance for common errors
      if (error.message.includes('404') || error.message.includes('not found')) {
        console.error('\n     💡 Tip: The object type may not exist in your ontology.');
        console.error('        Run Test 1 to see available object types.');
      }
    }
    return false;
  }
}

async function main() {
  console.log('\n🚀 Foundry Ontology Query Test');
  console.log('═'.repeat(50));

  const results: boolean[] = [];

  // Test 1: List object types (helps us know what's available)
  const { passed: test1Passed, objectTypes } = await testListObjectTypes();
  results.push(test1Passed);

  // Test 2: Search with auto-discover (searches across multiple object types)
  // You can customize this query based on your ontology
  const genericQuery = 'data'; // Change this to match something in your ontology
  results.push(await testSearchWithAutoDiscover(genericQuery));

  // Test 3: Query a specific object type (if we found any in Test 1)
  if (objectTypes.length > 0) {
    const firstObjectType = objectTypes[0];
    results.push(await testQuerySpecificType(firstObjectType, genericQuery));
  } else {
    console.log('\n📋 Test 3: Skipped (no object types available)');
  }

  console.log('\n' + '═'.repeat(50));
  console.log('📊 Summary');
  console.log('─'.repeat(50));

  const passed = results.filter((r) => r).length;
  console.log(`Passed: ${passed}/${results.length}`);

  if (passed === results.length) {
    console.log('\n✅ All tests passed!');
    console.log('\n💡 Integration Status:');
    console.log('   The ontology query tool is working correctly and can be used');
    console.log('   by the deep research agent to search internal Foundry data.');
  } else {
    console.log('\n⚠️  Some tests failed - check output above');
  }

  console.log('\n📝 Notes:');
  console.log('   • Object types are specific to your Foundry ontology');
  console.log('   • Search queries use semantic text matching');
  console.log('   • Results are automatically truncated to 15KB');
  console.log('   • Customize the search queries in this script to match your data');
}

main().catch(console.error);
````

## File: src/app/api/deep-research/activity-tracker.ts
````typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Activity, ResearchState } from './types';


export const createActivityTracker = (dataStream: any, researchState: ResearchState) => {

    return {
        add: (type: Activity['type'], status: Activity['status'], message: Activity['message'] ) => {
            dataStream.writeData({
                type: "activity",
                content:{
                    type,
                    status,
                    message, 
                    timestamp: Date.now(),
                    completedSteps: researchState.completedSteps,
                    tokenUsed: researchState.tokenUsed
                }
            })
        }
    }
}
````

## File: src/app/api/deep-research/types.ts
````typescript
import { z } from "zod";


export interface ResearchFindings {
    summary: string,
    source: string
}

export interface ResearchState {
    topic: string,
    completedSteps: number,
    tokenUsed: number,
    findings: ResearchFindings[],
    processedUrl: Set<string>,
    clerificationsText: string
}

export interface ModelCallOptions<T>{
    model: string;
    prompt: string;
    system: string;
    schema?: z.ZodType<T>;
    activityType?: Activity["type"]
}

export interface SearchResult{
    title: string;
    url: string;
    content: string
}

export interface Activity{
    type: 'search' | 'extract' | 'analyze' | 'generate' | 'planning';
    status: 'pending' | 'complete' | 'warning' | 'error';
    message: string;
    timestamp?: number;
}

export type ActivityTracker = {
    add: (type: Activity['type'], status: Activity['status'], message: Activity['message']) => void;
}


export interface Source {
    url: string;
    title: string
}
````

## File: src/app/api/deep-research/utils.ts
````typescript
import { Activity, ActivityTracker, ResearchFindings } from "./types";

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const combineFindings = (findings: ResearchFindings[]) : string => {
    return findings.map(finding => `${finding.summary}\n\n Source: ${finding.source}`).join('\n\n---\n\n')
}

export const handleError = <T>(error: unknown, context: string,activityTracker?:ActivityTracker, activityType?: Activity["type"], fallbackReturn?: T) =>{

    const errorMessage = error instanceof Error ? error.message : 'Unkown error';

    if(activityTracker && activityType){
        activityTracker.add(activityType, "error", `${context} failed" ${errorMessage}`)
    }
    return fallbackReturn
}
````

## File: src/components/ui/deep-research/CompletedQuestions.tsx
````typescript
'use client'
import { useDeepResearchStore } from '@/store/deepResearch'
import React from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"

const CompletedQuestions = () => {
    const {questions, answers, isCompleted} = useDeepResearchStore();

    if(!isCompleted || questions.length === 0) return null;
    return (
        <Accordion type="single" collapsible className="w-full max-w-[90vw] sm:max-w-[80vw] xl:max-w-[50vw] bg-white/60 backdrop-blur-sm border px-4 py-2 rounded-xl">
          <AccordionItem value="item-0" className="border-0">
            <AccordionTrigger className="text-base capitalize hover:no-underline">
              <span>Questions and Answers</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mx-auto py-6 space-y-8">
                <Accordion type="single" collapsible className="w-full">
                  {questions.map((question, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="text-black/70">
                          Question {index + 1}: {question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="bg-muted/50 p-4 rounded-md">
                        <p className="text-muted-foreground">{answers[index]}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )
    } 

export default CompletedQuestions
````

## File: src/components/ui/deep-research/QuestionForm.tsx
````typescript
import React from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from '../textarea'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { useDeepResearchStore } from '@/store/deepResearch'

const formSchema = z.object({
  answer: z.string().min(1, "Answer is required!")
})



const QuestionForm = () => {

    const {questions, currentQuestion, answers, setCurrentQuestion, setAnswers, setIsCompleted, isLoading, isCompleted} = useDeepResearchStore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            answer: answers[currentQuestion] || "",
        },
      })
     
      // 2. Define a submit handler.
      function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = values.answer;
        setAnswers(newAnswers)

        if(currentQuestion < questions.length - 1){
            setCurrentQuestion(currentQuestion + 1);
            form.reset()
        }else{
            setIsCompleted(true)
        }
      }

      if(isCompleted) return;

      if (questions.length === 0) return;


  return (

    <Card className='w-full  max-w-[90vw] sm:max-w-[80vw] xl:max-w-[50vw] shadow-none bg-white/60 backdrop-blur-sm border rounded-xl border-black/10 border-solid px-4 py-6'>
  <CardHeader className='px-4 sm:px-6'>
    <CardTitle className='text-base text-primary/50'>
        Question {currentQuestion + 1} of {questions.length}
    </CardTitle>
  </CardHeader>
  <CardContent className='space-y-6 w-full px-4 sm:px-6'>
    <p className='text-base'>{questions[currentQuestion]}</p>
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <FormField
        control={form.control}
        name="answer"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea placeholder="Type your answer here..." {...field}
              className='px-4 py-2 text-base resize-none placeholder:text-sm border-black/20'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex justify-between items-center">

      <Button type="button" variant={"outline"}
      onClick={() => {
        if(currentQuestion > 0){
            setCurrentQuestion(currentQuestion - 1)
            form.setValue("answer", answers[currentQuestion-1] || "")
        }
      }}
      >Previous</Button>


      <Button type="submit"
      disabled={isLoading}
      >
        {
            currentQuestion === questions.length - 1 ? "Start Research" : "Next"
        }
      </Button>
      </div>
      
    </form>
  </Form>

  <div className='h-1 w-full bg-gray-200 rounded'>
    <div 
    className='h-1 bg-primary rounded transition-all duration-300'
    style={{
        width: `${((currentQuestion + 1) / questions.length)*100}%`
    }}
    />
  </div>
  
  </CardContent>
</Card>
   
  )
}

export default QuestionForm
````

## File: src/components/ui/deep-research/ResearchActivities.tsx
````typescript
'use client'
import { useDeepResearchStore } from '@/store/deepResearch'
import React, { useState } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from '../button'
import { ChevronDown } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {format} from "date-fns"
import Link from 'next/link'

const ResearchActivities = () => {
const {activities, sources} = useDeepResearchStore();
const [isOpen, setIsOpen] = useState(true)

if (activities.length === 0) return;

  return (
    <div className='w-[90vw] sm:w-[400px] fixed top-4 right-4 z-20'>
<Collapsible className='w-full' open={isOpen} onOpenChange={setIsOpen}>
<div className="flex justify-end mb-2">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-9 p-0">
              <ChevronDown className={`h-4 w-4 ${isOpen ? 'rotate-180' : ''}`} />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
  <CollapsibleContent className='h-[50vh]'>
  <Tabs defaultValue="activities" className="w-full h-full shadow-md">
  <TabsList className='w-full px-2 py-6'>
    <TabsTrigger value="activities" className='flex-1 shadow-none border-black/10 border-solid'>Activities</TabsTrigger>
    {
      sources.length > 0 && <TabsTrigger value="sources">Sources</TabsTrigger>
    }
  </TabsList>
  <TabsContent value="activities" className='h-[calc(100%-60px)] overflow-y-auto border-black/10 border-solid shadow-none bg-white/60 backdrop-blur-sm border rounded-xl '>
    <ul className='space-y-4 p-4'>
      {
        activities.map((activity, index) => <li key={index} className='flex flex-col gap-2 border-b p-2 text-sm'>
          <div className='flex items-center gap-2'>
            <span className={`
               ${activity.status === 'complete' ? "bg-green-500" : 
                activity.status === 'error' ? "bg-red-500" : "bg-yellow-500"
               } min-w-2 min-h-2 h-2 block rounded-full
              `}>
              &nbsp;
            </span>

            <p>
              {activity.message.includes("https://") ? activity.message.split("https://")[0] + 
              activity.message.split("https://")[1].split("/")[0] : activity.message
            }
            </p>
          </div>
          {
activity.timestamp && 
<span className='text-xs text-muted-foreground'>
{format(activity.timestamp, 'HH:mm:ss')}
</span>
          }
        </li>
         )
      }
    </ul>
  </TabsContent>
  {
    sources.length > 0 &&

    <TabsContent value="sources" className='h-[calc(100%-60px)] overflow-y-auto shadow-none bg-white/60 backdrop-blur-sm border rounded-xl border-black/10 border-solid'>
         <ul className='space-y-4 p-4'>
          {
            sources.map((source, index) => {
              return <li key={index} className='flex flex-col gap-2 border-b p-2'>
                <Link href={source.url} target='_blank' className='text-sm text-blue-600 hover:underline'>
                {source.title}
                </Link>
                
              </li>
            })
          }
         </ul>
  </TabsContent>
  }
</Tabs>
  </CollapsibleContent>
</Collapsible>

    </div>
  )
}

export default ResearchActivities
````

## File: src/components/ui/deep-research/ResearchReport.tsx
````typescript
"use client";
import { useDeepResearchStore } from "@/store/deepResearch";
import React, { ComponentPropsWithRef } from "react";
import { Card } from "../card";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Prism as SyntaxHighlighter,
  SyntaxHighlighterProps,
} from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Download } from "lucide-react";
import { Button } from "../button";

type CodeProps = ComponentPropsWithRef<"code"> & {
  inline?: boolean;
};

const ResearchReport = () => {
  const { report, isCompleted, isLoading, topic } = useDeepResearchStore();

  const handleMarkdownDownload = () => {
    const content = report.split("<report>")[1].split("</report>")[0];
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic}-research-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isCompleted) return null;

  if (report.length <= 0 && isLoading) {
    return (
      <Card className="p-4 max-w-[50vw] bg-white/60 border px-4 py-2 rounded-xl">
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">
            Researching your topic...
          </p>
        </div>
      </Card>
    );
  }

  if (report.length <= 0) return null;

  return (
    <Card
      className="max-w-[90vw] xl:max-w-[60vw] relative px-4 py-6 rounded-xl border-black/10 border-solid shadow-none p-6
     bg-white/60 backdrop-blur-xl border antialiased
    "
    >
      <div className="flex justify-end gap-2 mb-4 absolute top-4 right-4">
        <Button
          size="sm"
          className="flex items-center gap-2 rounded"
          onClick={handleMarkdownDownload}
        >
          <Download className="w-4 h-4" /> Download
        </Button>
      </div>

      <div className="prose prose-sm md:prose-base max-w-none prose-pre:p-2 overflow-x-scroll">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, inline, ...props }: CodeProps) {
              const match = /language-(\w+)/.exec(className || "");
              const language = match ? match[1] : "";

              if (!inline && language) {
                const SyntaxHighlighterProps: SyntaxHighlighterProps = {
                  style: nightOwl,
                  language,
                  PreTag: "div",
                  children: String(children).replace(/\n$/, ""),
                };

                return <SyntaxHighlighter {...SyntaxHighlighterProps} />;
              }

              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {report.split("<report>")[1].split("</report>")[0]}
        </Markdown>
      </div>
    </Card>
  );
};

export default ResearchReport;
````

## File: src/components/ui/deep-research/ResearchTimer.tsx
````typescript
"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { useDeepResearchStore } from "@/store/deepResearch"

function ResearchTimer() {
  const { report, isCompleted, activities } = useDeepResearchStore()
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    // Reset elapsed time when activities are reset
    if (activities.length <= 0) {
      setElapsedTime(0);
      return;
    }
    
    if (report.length > 10) return;
    
    const startTime = Date.now()
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 16)

    return () => clearInterval(timer)
  }, [report, isCompleted, activities])

  if (activities.length <= 0) return null

  const seconds = Math.floor(elapsedTime / 1000)
  const milliseconds = elapsedTime % 1000

  return (
    <Card className="p-2 bg-white/60 backdrop-blur-sm border border-black/10 border-solid shadow-none rounded">
      <p className="text-sm text-muted-foreground">
        Time elapsed: <span className="font-mono min-w-[55px] inline-block">{seconds > 60 ? `${Math.floor(seconds / 60)}m ${seconds % 60 > 0 ? `${(seconds % 60).toString().padStart(2, '0')}s` : ''}` : `${seconds}.${milliseconds.toString().padStart(3, '0')}s`}</span>
      </p>
    </Card>
  )
} 
export default ResearchTimer
````

## File: src/components/ui/deep-research/UserInput.tsx
````typescript
"use client";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDeepResearchStore } from "@/store/deepResearch";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  input: z.string().min(2).max(200),
});

const UserInput = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { setQuestions, setTopic } = useDeepResearchStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      input: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        body: JSON.stringify({ topic: values.input }),
      });
      const data = await response.json();
      setTopic(values.input);
      setQuestions(data);
      form.reset();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-[90vw] sm:w-[80vw] xl:w-[50vw]">
      <FormField
        control={form.control}
        name="input"
        render={({ field }) => (
          <FormItem className='flex-1 w-full'>
            <FormControl>
              <Input 
                placeholder="Enter your research topic" 
                {...field} 
                className='rounded-full w-full flex-1 p-4 py-4 sm:py-6 placeholder:text-sm bg-white/60 backdrop-blur-sm border-black/10 border-solid shadow-none'
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" className='rounded-full px-6 cursor-pointer' disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          'Submit'
        )}
      </Button>
    </form>
  </Form>
  );
};

export default UserInput;
````

## File: src/components/ui/accordion.tsx
````typescript
"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
````

## File: src/components/ui/button.tsx
````typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
````

## File: src/components/ui/card.tsx
````typescript
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 px-6", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
````

## File: src/components/ui/collapsible.tsx
````typescript
"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
````

## File: src/components/ui/form.tsx
````typescript
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive-foreground", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive-foreground text-sm", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
````

## File: src/components/ui/input.tsx
````typescript
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
````

## File: src/components/ui/label.tsx
````typescript
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
````

## File: src/components/ui/progress.tsx
````typescript
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
````

## File: src/components/ui/radio-group.tsx
````typescript
"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
````

## File: src/components/ui/select.tsx
````typescript
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-9 w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-sm font-medium", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
````

## File: src/components/ui/skeleton.tsx
````typescript
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-primary/10 animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
````

## File: src/components/ui/sonner.tsx
````typescript
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
````

## File: src/components/ui/tabs.tsx
````typescript
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-1",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
````

## File: src/components/ui/textarea.tsx
````typescript
import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
````

## File: src/components/ui/tooltip.tsx
````typescript
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
````

## File: src/lib/foundry-provider.ts
````typescript
import { createFoundry } from '@northslopetech/foundry-ai-sdk';

export const foundry = createFoundry({
  foundryToken: process.env.FOUNDRY_TOKEN,
  baseURL: process.env.FOUNDRY_BASE_URL,
});
````

## File: src/lib/utils.ts
````typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
````

## File: src/lib/zod-to-json-schema.ts
````typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';

type JsonSchema = {
  type: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  description?: string;
};

// Helper to get Zod type name (Zod v4 compatible)
function getZodTypeName(schema: any): string {
  // Zod v4 uses _zod.def.type or similar internal structure
  // Try multiple approaches for compatibility
  if (schema?._zod?.def?.type) return schema._zod.def.type;
  if (schema?._def?.typeName) return schema._def.typeName;
  if (schema?.constructor?.name) return schema.constructor.name;
  return 'unknown';
}

/**
 * Converts a Zod schema to JSON Schema format.
 * Updated for Zod v4 compatibility.
 * Handles the subset of Zod types used in this codebase:
 * - z.object()
 * - z.string()
 * - z.boolean()
 * - z.array()
 */
export function zodToJsonSchema(schema: z.ZodTypeAny): JsonSchema {
  const typeName = getZodTypeName(schema);

  // Handle ZodObject
  if (typeName === 'object' || typeName === 'ZodObject') {
    // In Zod v4, shape might be accessed via _zod.def.shape or schema.shape
    const shape = (schema as any)._zod?.def?.shape ?? (schema as any).shape ?? {};
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value as z.ZodTypeAny);
      // All fields are required unless wrapped in .optional()
      const valueTypeName = getZodTypeName(value);
      if (valueTypeName !== 'optional' && valueTypeName !== 'ZodOptional') {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      required,
    };
  }

  // Handle ZodString
  if (typeName === 'string' || typeName === 'ZodString') {
    const result: JsonSchema = { type: 'string' };
    const desc = (schema as any).description ?? (schema as any)._zod?.def?.description;
    if (desc) {
      result.description = desc;
    }
    return result;
  }

  // Handle ZodBoolean
  if (typeName === 'boolean' || typeName === 'ZodBoolean') {
    const result: JsonSchema = { type: 'boolean' };
    const desc = (schema as any).description ?? (schema as any)._zod?.def?.description;
    if (desc) {
      result.description = desc;
    }
    return result;
  }

  // Handle ZodNumber
  if (typeName === 'number' || typeName === 'ZodNumber') {
    const result: JsonSchema = { type: 'number' };
    const desc = (schema as any).description ?? (schema as any)._zod?.def?.description;
    if (desc) {
      result.description = desc;
    }
    return result;
  }

  // Handle ZodArray
  if (typeName === 'array' || typeName === 'ZodArray') {
    // In Zod v4, element type might be at _zod.def.element or schema.element
    const element = (schema as any)._zod?.def?.element ?? (schema as any).element;
    const result: JsonSchema = {
      type: 'array',
      items: element ? zodToJsonSchema(element) : { type: 'string' },
    };
    const desc = (schema as any).description ?? (schema as any)._zod?.def?.description;
    if (desc) {
      result.description = desc;
    }
    return result;
  }

  // Handle ZodOptional - unwrap and process inner type
  if (typeName === 'optional' || typeName === 'ZodOptional') {
    const inner = (schema as any)._zod?.def?.innerType ?? (schema as any).unwrap?.();
    if (inner) {
      return zodToJsonSchema(inner);
    }
  }

  // Handle ZodEffects (for .describe() calls that wrap the type)
  if (typeName === 'effects' || typeName === 'ZodEffects') {
    const inner = (schema as any)._zod?.def?.schema ?? (schema as any).innerType?.();
    if (inner) {
      return zodToJsonSchema(inner);
    }
  }

  // Fallback for unknown types
  return { type: 'string' };
}
````

## File: src/store/deepResearch.ts
````typescript
import { Activity, Source } from "@/app/api/deep-research/types";
import { create } from "zustand";

interface DeepResearchState {
  topic: string;
  questions: string[];
  answers: string[];
  currentQuestion: number;
  isCompleted: boolean;
  isLoading: boolean;
  activities: Activity[];
  sources: Source[];
  report: string;
}

interface DeepResearchActions {
  setTopic: (topic: string) => void;
  setQuestions: (questions: string[]) => void;
  setAnswers: (answers: string[]) => void;
  setCurrentQuestion: (index: number) => void;
  setIsCompleted: (isCompleted: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setActivities: (activities: Activity[]) => void,
  setSources: (sources: Source[]) => void,
  setReport: (report: string) => void,
}

const initialState: DeepResearchState = {
  topic: "",
  questions: [],
  answers: [],
  currentQuestion: 0,
  isCompleted: false,
  isLoading: false,
  activities: [],
  sources: [],
  report: "",
};

export const useDeepResearchStore = create<
  DeepResearchState & DeepResearchActions
>((set) => ({
  ...initialState,
  setTopic: (topic: string) => set({ topic }),
  setQuestions: (questions: string[]) => set({ questions }),
  setAnswers: (answers: string[]) => set({ answers }),
  setCurrentQuestion: (currentQuestion: number) => set({ currentQuestion }),
  setIsCompleted: (isCompleted: boolean) => set({ isCompleted }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setActivities: (activities: Activity[]) => set({ activities }),
  setSources: (sources: Source[]) => set({ sources }),
  setReport: (report: string) => set({ report }),
}));
````

## File: .envrc.example
````
# Foundry Configuration
# Copy this file to .envrc and fill in your actual values
# Run `direnv allow` after updating .envrc

export FOUNDRY_TOKEN=your-foundry-token-here
export FOUNDRY_BASE_URL=https://northslope.palantirfoundry.com

# Ontology RID (full format: ri.ontology.main.ontology.xxxxxxxx)
export FOUNDRY_ONTOLOGY_RID=ri.ontology.main.ontology.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Ontology API Name (used in URLs, without ri. prefix)
export FOUNDRY_ONTOLOGY_API_NAME=ontology-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Function name for web search (Ontology Query function name)
export FOUNDRY_WEB_SEARCH_FUNCTION_NAME=searchWebBatch
````

## File: .npmrc
````
//northslope.palantirfoundry.com/artifacts/api/repositories/ri.artifacts.main.repository.4429d415-d244-4008-87d1-a3828b94e463/contents/release/npm/:_authToken=${FOUNDRY_TOKEN}
@deep-research-service-user:registry=https://northslope.palantirfoundry.com/artifacts/api/repositories/ri.artifacts.main.repository.4429d415-d244-4008-87d1-a3828b94e463/contents/release/npm
````

## File: components.json
````json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
````

## File: eslint.config.mjs
````
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
````

## File: postcss.config.mjs
````
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
````

## File: src/app/api/deep-research/model-caller.ts
````typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateText, tool } from "ai";
import { foundry } from "@/lib/foundry-provider";
import { zodToJsonSchema } from "@/lib/zod-to-json-schema";
import { ActivityTracker, ModelCallOptions, ResearchState } from "./types";
import { MAX_RETRY_ATTEMPTS, RETRY_DELAY_MS } from "./constants";
import { delay } from "./utils";

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

  while (attempts < MAX_RETRY_ATTEMPTS) {
    try {
      if (schema) {
        // Structured output via forced tool call (Foundry doesn't support generateObject)
        const jsonSchema = zodToJsonSchema(schema);

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
          throw new Error("Model failed to call submit_result tool");
        }

        // AI SDK v5 uses .input
        const toolArgs = toolCall.input;

        if (!toolArgs) {
          throw new Error("No arguments in tool call");
        }

        researchState.tokenUsed += result.usage?.totalTokens || 0;
        researchState.completedSteps++;

        return toolArgs as T;
      } else {
        // Text generation - straightforward
        const result = await generateText({
          model: getModel(model),
          prompt,
          system,
          maxOutputTokens: 8000,  // AI SDK v5: maxTokens -> maxOutputTokens
        });

        researchState.tokenUsed += result.usage?.totalTokens || 0;
        researchState.completedSteps++;

        return result.text;
      }
    } catch (error) {
      attempts++;
      lastError = error instanceof Error ? error : new Error("Unknown error");

      if (attempts < MAX_RETRY_ATTEMPTS) {
        activityTracker.add(
          activityType,
          "warning",
          `Model call failed, attempt ${attempts}/${MAX_RETRY_ATTEMPTS}. Retrying...`
        );
      }
      await delay(RETRY_DELAY_MS * attempts);
    }
  }

  throw lastError || new Error(`Failed after ${MAX_RETRY_ATTEMPTS} attempts!`);
}
````

## File: src/app/api/deep-research/route.ts
````typescript
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { ResearchState } from "./types";
import { deepResearch } from "./main";

/* eslint-disable @typescript-eslint/no-explicit-any */
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

    const lastMessageContent = messages[messages.length - 1].content;
    console.log("[deep-research] Last message content:", lastMessageContent?.substring?.(0, 100));

    const parsed = JSON.parse(lastMessageContent);

    const topic = parsed.topic;
    const clarifications = parsed.clarifications || parsed.clerifications; // handle both spellings

    console.log("[deep-research] Starting research for topic:", topic);

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
            clerificationsText: JSON.stringify(clarifications)
        }

        try {
          await deepResearch(researchState, dataStream);
          console.log("[deep-research] Execute completed successfully");
        } catch (err) {
          console.error("[deep-research] Execute error:", err);
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
        { status: 200 }
      );

  }
}
````

## File: src/app/api/deep-research/services.ts
````typescript
// This file previously contained OpenRouter and Exa service initialization.
// These have been replaced by the Foundry provider in src/lib/foundry-provider.ts
// and mocked Foundry tools in ./foundry-tools.ts

// File kept for reference - can be deleted if not needed.
````

## File: src/app/api/generate-questions/route.ts
````typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { generateText, tool } from "ai";
import { foundry } from "@/lib/foundry-provider";
import { z } from "zod";

// Type assertion needed due to AI SDK LanguageModelV1 vs V2 mismatch
const getModel = (modelId: string) => foundry(modelId) as any;

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
  const prompt = `Given the research topic "${topic}", generate 2-4 clarifying questions to help narrow down the research scope. Focus on identifying:
- Specific aspects of interest
- Required depth/complexity level
- Any particular perspective or excluded sources

IMPORTANT: You must respond ONLY by calling the 'submit_result' tool with your answer.`;

  try {
    const result = await generateText({
      model: getModel("GPT_5"),
      prompt,
      tools: {
        submit_result: tool({
          description: "Submit the generated clarifying questions",
          inputSchema: questionsSchema,  // AI SDK v5: parameters -> inputSchema
          providerOptions: {
            foundry: { parameters: questionsJsonSchema },
          },
          // Execute is required for the SDK to properly detect and send tools
          execute: async (args) => args,
        }),
      },
      maxOutputTokens: 4000,  // AI SDK v5: maxTokens -> maxOutputTokens
    });

    // AI SDK v5 uses .input
    const toolCall = result.toolCalls?.[0];
    if (toolCall) {
      const input = toolCall.input as { questions?: string[] };
      return input?.questions || [];
    }

    return [];
  } catch (error) {
    console.log("Error while generating questions: ", error);
    return [];
  }
};

export async function POST(req: Request) {
  const { topic } = await req.json();
  console.log("Topic: ", topic);

  try {
    const questions = await clarifyResearchGoals(topic);
    console.log("Questions: ", questions);

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error while generating questions: ", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
````

## File: src/app/globals.css
````css
@import "tailwindcss";

@plugin "tailwindcss-animate";
@plugin "@tailwindcss/typography";

@custom-variant dark (&:is(.dark *));

@theme inline {

  --font-dancing-script: var(--font-dancing-script);
  --font-inter: var(--font-inter);



  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: oklch(0.439 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
````

## File: src/app/layout.tsx
````typescript
import type { Metadata } from "next";
import { Dancing_Script, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dancingScript.variable} font-inter antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
````

## File: src/app/page.tsx
````typescript
import QnA from "@/components/ui/deep-research/QnA";
import UserInput from "@/components/ui/deep-research/UserInput";
import Image from "next/image";
import bg from "../../public/background.jpg"

export default function Home() {
  return (
      <main className="min-h-screen w-full flex flex-col items-center justify-start gap-8 py-16">

        <div className="fixed top-0 left-0 w-full h-full object-cover  -z-10 bg-black/30">
          <Image src={bg} alt="Deep Research AI Agent" className="w-full h-full object-cover opacity-50" />
        </div>

        <div className="flex flex-col items-center gap-4">
        <h1 className="text-5xl sm:text-8xl font-bold font-dancing-script italic bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Deep Research
        </h1>
        <p className="text-gray-600 text-center max-w-[90vw] sm:max-w-[50vw]">
          Enter a topic and answer a few questions to generate a comprehensive research report.
        </p>
        </div>

        <UserInput />
        <QnA />
       
      </main>
    
  );
}
````

## File: src/components/ui/deep-research/QnA.tsx
````typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useDeepResearchStore } from "@/store/deepResearch";
import React, { useEffect, useRef, useState } from "react";
import QuestionForm from "./QuestionForm";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ResearchActivities from "./ResearchActivities";
import ResearchReport from "./ResearchReport";
import ResearchTimer from "./ResearchTimer";
import CompletedQuestions from "./CompletedQuestions";

const QnA = () => {
  const {
    questions,
    isCompleted,
    topic,
    answers,
    setIsLoading,
    setActivities,
    setSources,
    setReport,
  } = useDeepResearchStore();

  // Track accumulated data from messages
  const [streamData, setStreamData] = useState<unknown[]>([]);
  const hasStartedRef = useRef(false);

  // AI SDK v5: useChat with transport and sendMessage
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/deep-research",
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Extract data from messages - AI SDK v5 uses message parts for custom data
  useEffect(() => {
    const allData: unknown[] = [];
    for (const message of messages) {
      if (message.parts) {
        for (const part of message.parts) {
          // Custom data parts in AI SDK v5
          if ((part as any).type === "data" && (part as any).value) {
            allData.push(...(part as any).value);
          }
        }
      }
    }
    setStreamData(allData);
  }, [messages]);

  // Process stream data for activities, sources, and report
  useEffect(() => {
    if (streamData.length === 0) return;

    // extract activities and sources
    const activities = streamData
      .filter(
        (msg) => typeof msg === "object" && (msg as any).type === "activity"
      )
      .map((msg) => (msg as any).content);

    setActivities(activities);

    const sources = activities
      .filter(
        (activity) =>
          activity.type === "extract" && activity.status === "complete"
      )
      .map((activity) => {
        const url = activity.message.split("from ")[1];
        return {
          url,
          title: url?.split("/")[2] || url,
        };
      });
    setSources(sources);
    const reportData = streamData.find(
      (msg) => typeof msg === "object" && (msg as any).type === "report"
    );
    const report =
      typeof (reportData as any)?.content === "string"
        ? (reportData as any).content
        : "";
    setReport(report);

    setIsLoading(isLoading);
  }, [streamData, setActivities, setSources, setReport, setIsLoading, isLoading]);

  // Start research when questions are completed
  useEffect(() => {
    if (isCompleted && questions.length > 0 && !hasStartedRef.current) {
      hasStartedRef.current = true;
      const clarifications = questions.map((question, index) => ({
        question: question,
        answer: answers[index],
      }));

      // AI SDK v5: sendMessage with parts array
      sendMessage({
        parts: [{
          type: "text",
          text: JSON.stringify({
            topic: topic,
            clarifications: clarifications,
          }),
        }],
      });
    }
  }, [isCompleted, questions, answers, topic, sendMessage]);

  if (questions.length === 0) return null;

  return (
    <div className="flex gap-4 w-full flex-col items-center mb-16">
      <QuestionForm />
      <CompletedQuestions />
      <ResearchTimer />
      <ResearchActivities />
      <ResearchReport />
    </div>
  );
};

export default QnA;
````

## File: src/lib/foundry-client.ts
````typescript
/**
 * Foundry API Client
 * Provides functions to interact with Palantir Foundry APIs
 */

const FOUNDRY_TOKEN = process.env.FOUNDRY_TOKEN;
const FOUNDRY_BASE_URL = process.env.FOUNDRY_BASE_URL;

if (!FOUNDRY_TOKEN || !FOUNDRY_BASE_URL) {
  console.warn('Warning: FOUNDRY_TOKEN or FOUNDRY_BASE_URL not set. Foundry API calls will fail.');
}

// Type definitions for Foundry API responses
interface FoundryOntologyObject {
  rid: string;
  properties: Record<string, unknown>;
}

interface FoundrySearchResponse {
  data?: FoundryOntologyObject[];
  totalCount?: number;
  nextPageToken?: string;
  searchedTypes?: string[];
  message?: string;
}

interface FoundryObjectType {
  apiName: string;
}

interface FoundryObjectTypesResponse {
  data?: FoundryObjectType[];
}

interface FoundryPropertyDefinition {
  baseType?: string;
  type?: string;
  dataType?: { type?: string };
}

interface FoundryObjectSchema {
  properties?: Record<string, FoundryPropertyDefinition>;
}

/**
 * Generic function to call Foundry API endpoints
 */
async function callFoundryAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> {
  const url = `${FOUNDRY_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${FOUNDRY_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Foundry API error (${response.status}): ${errorText}`
    );
  }

  return response.json();
}

/**
 * Get the Ontology RID for the default ontology
 * This is a simplified version - in production you might want to:
 * 1. Cache this value
 * 2. Accept ontologyRid as a parameter
 * 3. Have a way to discover/configure the ontology
 *
 * Returns null if not configured (allows graceful fallback)
 */
export async function getOntologyRid(): Promise<string | null> {
  const configuredOntologyRid = process.env.FOUNDRY_ONTOLOGY_RID;

  if (configuredOntologyRid) {
    return configuredOntologyRid;
  }

  return null;
}

/**
 * Search objects in the Foundry Ontology
 * This is a simplified semantic search that queries across object types
 *
 * If no objectType is specified, this will:
 * 1. Discover available object types
 * 2. Search across the first few types (to avoid rate limiting)
 * 3. Combine and return results
 */
export async function searchOntologyObjects(
  searchQuery: string,
  options: {
    ontologyRid?: string;
    objectType?: string;
    maxResults?: number;
    autoDiscover?: boolean; // If true, search across multiple object types
  } = {}
): Promise<FoundrySearchResponse> {
  const ontologyRid = options.ontologyRid || await getOntologyRid();

  // If no ontology RID is configured, return empty results gracefully
  if (!ontologyRid) {
    console.warn('FOUNDRY_ONTOLOGY_RID not configured - ontology search disabled');
    return {
      data: [],
      totalCount: 0,
      message: 'Ontology search not configured'
    };
  }

  const {
    objectType,
    maxResults = 10,
    autoDiscover = false,
  } = options;

  try {
    // If a specific object type is provided, search only that type
    if (objectType) {
      const endpoint = `/api/v1/ontologies/${ontologyRid}/objects/${objectType}/search`;

      const requestBody = {
        query: {
          type: 'anyTerm',
          value: searchQuery,
        },
        pageSize: maxResults,
      };

      return await callFoundryAPI(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }) as FoundrySearchResponse;
    }

    // If autoDiscover is enabled, search across multiple object types
    if (autoDiscover) {
      console.log('Auto-discovering object types and searching...');

      // Get available object types
      const objectTypes = await listObjectTypes(ontologyRid);

      if (objectTypes.length === 0) {
        console.warn('No object types found in ontology');
        return { data: [], totalCount: 0 };
      }

      console.log(`Found ${objectTypes.length} object types, searching top 5...`);

      // Search across first 5 object types to avoid too many API calls
      const typesToSearch = objectTypes.slice(0, 5);
      const searchPromises = typesToSearch.map(type =>
        queryOntologyByType(type, searchQuery, { ontologyRid, maxResults: 3 })
          .catch(err => {
            console.warn(`Failed to search type ${type}:`, err.message);
            return { data: [], totalCount: 0 };
          })
      );

      const results = await Promise.all(searchPromises);

      // Combine results from all types
      const allData = results.flatMap(r => r.data || []);
      const totalCount = results.reduce((sum, r) => sum + (r.totalCount || 0), 0);

      return {
        data: allData.slice(0, maxResults),
        totalCount,
        searchedTypes: typesToSearch,
      };
    }

    // Default: return error asking user to specify object type
    throw new Error(
      'Please specify an objectType or set autoDiscover:true. ' +
      'Use listObjectTypes() to see available types.'
    );

  } catch (error) {
    console.error('Error searching ontology objects:', error);
    throw error;
  }
}

/**
 * Get the schema/properties for a specific object type
 */
export async function getObjectTypeSchema(
  objectType: string,
  ontologyRid?: string
): Promise<FoundryObjectSchema> {
  const rid = ontologyRid || await getOntologyRid();

  if (!rid) {
    throw new Error('FOUNDRY_ONTOLOGY_RID not configured');
  }

  const endpoint = `/api/v1/ontologies/${rid}/objectTypes/${objectType}`;

  try {
    const response = await callFoundryAPI(endpoint, {
      method: 'GET',
    }) as FoundryObjectSchema;

    return response;
  } catch (error) {
    console.error(`Error getting schema for ${objectType}:`, error);
    throw error;
  }
}

/**
 * Extract searchable text field names from an object type schema
 */
function extractSearchableFields(schema: FoundryObjectSchema): string[] {
  const searchableFields: string[] = [];

  if (schema.properties) {
    for (const [fieldName, fieldDef] of Object.entries(schema.properties)) {
      const def = fieldDef as FoundryPropertyDefinition;
      // Check for string fields using the actual Foundry schema structure
      // baseType is the correct field in Foundry schemas
      if (def.baseType === 'String' || def.type === 'string' || def.dataType?.type === 'string') {
        searchableFields.push(`properties.${fieldName}`);
      }
    }
  }

  return searchableFields;
}

/**
 * Query specific object types in the ontology
 * This allows for more targeted searches when you know the object type
 */
export async function queryOntologyByType(
  objectType: string,
  searchQuery: string,
  options: {
    ontologyRid?: string;
    maxResults?: number;
    fields?: string[];
  } = {}
): Promise<FoundrySearchResponse> {
  const ontologyRid = options.ontologyRid || await getOntologyRid();

  if (!ontologyRid) {
    console.warn('FOUNDRY_ONTOLOGY_RID not configured - ontology search disabled');
    return { data: [], totalCount: 0 };
  }

  const {
    maxResults = 10,
    fields,
  } = options;

  const endpoint = `/api/v1/ontologies/${ontologyRid}/objects/${objectType}/search`;

  try {
    // Determine which fields to search
    let searchFields = fields;

    if (!searchFields || searchFields.length === 0) {
      try {
        // Get the object type schema to find searchable fields
        const schema = await getObjectTypeSchema(objectType, ontologyRid);
        searchFields = extractSearchableFields(schema);
        console.log(`  Found ${searchFields.length} searchable fields for ${objectType}`);

        if (searchFields.length === 0) {
          console.warn(`  No searchable string fields found for ${objectType}, skipping`);
          return { data: [], totalCount: 0 };
        }
      } catch {
        console.warn(`  Could not get schema for ${objectType}, skipping`);
        return { data: [], totalCount: 0 };
      }
    }

    // Construct a query that searches across all the fields
    let query;

    if (searchFields.length === 1) {
      // Single field - simple query
      query = {
        type: 'anyTerm',
        field: searchFields[0],
        value: searchQuery,
      };
    } else {
      // Multiple fields - use OR query
      query = {
        type: 'or',
        value: searchFields.map(field => ({
          type: 'anyTerm',
          field: field,
          value: searchQuery,
        })),
      };
    }

    const requestBody = {
      query,
      pageSize: maxResults,
    };

    const response = await callFoundryAPI(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    }) as FoundrySearchResponse;

    return response;
  } catch (error) {
    console.error(`Error querying ontology type ${objectType}:`, error);
    throw error;
  }
}

/**
 * List available object types in the ontology
 * Useful for discovering what types of objects are available
 */
export async function listObjectTypes(
  ontologyRid?: string
): Promise<string[]> {
  const rid = ontologyRid || await getOntologyRid();

  if (!rid) {
    console.warn('FOUNDRY_ONTOLOGY_RID not configured - cannot list object types');
    return [];
  }

  const endpoint = `/api/v1/ontologies/${rid}/objectTypes`;

  try {
    const response = await callFoundryAPI(endpoint, {
      method: 'GET',
    }) as FoundryObjectTypesResponse;

    return response.data?.map((type) => type.apiName) || [];
  } catch (error) {
    console.error('Error listing object types:', error);
    throw error;
  }
}
````

## File: CLAUDE.md
````markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Deep Research AI Agent being refactored to run on **Palantir Foundry's Language Model Service** via `@northslopetech/foundry-ai-sdk` instead of OpenRouter/Exa. The agent generates follow-up questions, crafts search queries, and compiles comprehensive research reports through an iterative loop.

## Commands

```bash
npm run dev      # Start dev server with Turbopack (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
npm install --legacy-peer-deps  # Use this flag if dependency issues arise
```

## Environment Variables

Required in `.env.local` (or `.envrc` for direnv):
- `FOUNDRY_TOKEN` - Palantir Foundry API token
- `FOUNDRY_BASE_URL` - Foundry API base URL (e.g., https://northslope.palantirfoundry.com)
- `FOUNDRY_ONTOLOGY_RID` - Your Foundry Ontology RID (required for ontology search)

### Finding Your Ontology RID

To find your Ontology RID:
1. Navigate to your Ontology in Foundry
2. Copy the RID from the URL (format: `ri.ontology.main.ontology.xxxxxxxx`)
3. Or use the Palantir MCP tool `get_foundry_ontology_rid` if you have it configured

## Deep Research Agent: Search Strategy

The research agent has been updated with comprehensive guidance on using both internal (Ontology) and external (Web) search sources.

### Agent's Search Capabilities

**Dual-Source Search**: Every search query is executed against BOTH sources simultaneously:
1. **Web Search (External)**: Public internet, best practices, open-source knowledge
2. **Ontology Search (Internal)**: Company-specific data, internal entities, proprietary information

### Iterative Search Strategy

The agent has been trained to:

1. **Initial Planning**: Generate diverse queries that work for both internal and external sources
2. **Result Analysis**: Understand what was found (or not found) in each source
3. **Iterative Refinement**: Create follow-up queries based on:
   - Specific entities discovered in Ontology results
   - Object types available but not yet matched
   - Gaps in coverage identified from both sources

### Key Prompt Updates

**Planning Phase (`PLANNING_SYSTEM_PROMPT`)**:
- Understands dual-source architecture
- Generates queries optimized for both internal and external data
- Balances between company-specific and general queries

**Analysis Phase (`ANALYSIS_SYSTEM_PROMPT`)**:
- Interprets Ontology results (RIDs, properties, searchedTypes)
- Identifies when to create targeted follow-up queries
- Uses discovered entity names in subsequent searches
- Handles empty results appropriately

**Extraction Phase (`EXTRACTION_SYSTEM_PROMPT`)**:
- Processes structured Ontology data (JSON with entities)
- Extracts web content (standard HTML/text)
- Preserves entity relationships and RIDs

**Report Phase (`REPORT_SYSTEM_PROMPT`)**:
- Clearly distinguishes internal vs external information
- Creates dedicated sections for company-specific data
- Maintains traceability with RIDs and entity references

## Ontology Query Tool

### Available Parameters

The `searchOntologyObjects()` function supports these parameters:

```typescript
searchOntologyObjects(searchQuery: string, options?: {
  ontologyRid?: string;      // Your ontology RID (defaults to FOUNDRY_ONTOLOGY_RID env var)
  objectType?: string;        // Specific object type to search (optional)
  maxResults?: number;        // Maximum results to return (default: 10)
  autoDiscover?: boolean;     // Auto-discover and search across types (default: false)
})
```

### Usage Modes

**1. Auto-Discover Mode (Recommended for Research Agent)**
```typescript
// Automatically discovers object types and searches across them
const results = await searchOntologyObjects("employee data", {
  autoDiscover: true,
  maxResults: 10
});
```

**2. Specific Object Type**
```typescript
// Search a specific object type when you know what you're looking for
const results = await searchOntologyObjects("John Smith", {
  objectType: "Employee",
  maxResults: 5
});
```

**3. List Available Types First**
```typescript
// Discover what object types exist in your ontology
const types = await listObjectTypes();
console.log(types); // ["Employee", "Department", "Project", ...]
```

### Testing

Run the ontology query test:
```bash
npm run test:ontology
```

Or manually:
```bash
npx tsx scripts/test-ontology-query.ts
```

**Note:** You must set `FOUNDRY_ONTOLOGY_RID` in your `.envrc` before running tests.

## Architecture

### Research Flow (`src/app/api/deep-research/`)

The iterative research loop in `main.ts`:
1. **Planning** → `generateSearchQueries()` creates initial queries
2. **Search** → `search()` fetches results (currently Exa, migrating to Foundry)
3. **Extract** → `processSearchResults()` / `extractContent()` summarizes each result
4. **Analyze** → `analyzeFindings()` determines if content is sufficient or needs more queries
5. **Report** → `generateReport()` creates final markdown report

### Key Files to Modify

| File | Purpose | Migration Notes |
|------|---------|-----------------|
| `model-caller.ts` | LLM abstraction layer | **Critical**: Replace `generateObject` with forced tool call workaround |
| `services.ts` | Provider initialization | Replace OpenRouter/Exa with Foundry provider |
| `constants.ts` | Model identifiers | Update to Foundry model IDs (e.g., `GPT_4o`) |
| `research-functions.ts` | Search implementation | Replace Exa with Foundry tools |

### Files Created

| File | Purpose | Status |
|------|---------|--------|
| `src/lib/foundry-provider.ts` | Initialize `@northslopetech/foundry-ai-sdk` | ✅ Created |
| `src/lib/foundry-client.ts` | Foundry API client for ontology queries | ✅ Created |
| `src/app/api/deep-research/foundry-tools.ts` | Web search + Ontology search tools | ✅ Implemented |

## Critical Foundry Provider Constraints

### 1. No `generateObject` Support
The Foundry provider fails on `generateObject`. Use this workaround pattern:

```typescript
const { toolCalls } = await generateText({
  model: foundry(model),
  prompt,
  system: system + "\n\nIMPORTANT: You must respond ONLY by calling the 'submit_result' tool.",
  tools: {
    submit_result: tool({
      description: 'Submit the final structured result',
      parameters: zodSchema,
      providerOptions: { foundry: { parameters: jsonSchema } }, // REQUIRED
    })
  },
  toolChoice: 'required',
  maxSteps: 1,
});
return toolCalls?.[0]?.args;
```

### 2. Dual Schema Requirement
Every tool must include **both** Zod schema AND manual JSON schema in `providerOptions`:

```typescript
const params = z.object({ query: z.string() });
const jsonSchema = { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] };

export const myTool = tool({
  parameters: params,
  providerOptions: { foundry: { parameters: jsonSchema } }, // Without this, tools send empty
  // ...
});
```

### 3. Context Window Limits
Foundry Ontology results are massive. **Always truncate** tool outputs:

```typescript
return JSON.stringify(result).slice(0, 15000);
```

## State Management

- `src/store/deepResearch.ts` - Zustand store for UI state
- `ResearchState` type in `types.ts` tracks: topic, findings, token usage, completed steps

## UI Components

- `src/components/ui/deep-research/` - Research-specific components
- `src/components/ui/` - Shadcn UI primitives
````

## File: next.config.ts
````typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler:{
    removeConsole: process.env.NODE_ENV === "production" ? true : false,
  }
};

export default nextConfig;
````

## File: tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "scripts"]
}
````

## File: scripts/test-api.ts
````typescript
/**
 * API Test Script
 *
 * Tests the deep-research API endpoints against a running dev server.
 *
 * Usage:
 *   1. Start the dev server: npm run dev
 *   2. In another terminal: npx tsx scripts/test-api.ts
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function testGenerateQuestions() {
  console.log('\n📋 Test 1: Generate Questions');
  console.log('─'.repeat(50));

  try {
    const response = await fetch(`${BASE_URL}/api/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'machine learning best practices' }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const questions = await response.json();
    console.log('  📊 Generated Questions:');

    if (Array.isArray(questions) && questions.length > 0) {
      questions.forEach((q: string, i: number) => {
        console.log(`    ${i + 1}. ${q}`);
      });
      console.log('\n  ✅ Generate Questions: PASSED');
      return true;
    } else {
      console.log('  ❌ No questions returned');
      console.log('  Response:', JSON.stringify(questions, null, 2));
      return false;
    }
  } catch (error) {
    console.error('  ❌ Test failed:', error);
    return false;
  }
}

async function testDeepResearch() {
  console.log('\n📋 Test 2: Deep Research (Streaming)');
  console.log('─'.repeat(50));
  console.log('  Testing with real Foundry web + ontology search');

  try {
    // The route expects messages array with content as JSON string
    const messageContent = JSON.stringify({
      topic: 'TypeScript best practices',
      clarifications: [
        { question: 'What depth?', answer: 'Intermediate' },
      ],
    });

    const response = await fetch(`${BASE_URL}/api/deep-research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: messageContent,
        }],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Read the streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let fullResponse = '';
    let activityCount = 0;
    let reportReceived = false;
    let finalReport = '';
    const activities: Array<{ status: string; message: string }> = [];

    console.log('\n  📊 Streaming Activities:');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      fullResponse += chunk;

      // AI SDK v5 uses SSE format: "event: ...\ndata: {...}\n\n"
      // Parse streaming data - handle both old and new formats
      const lines = chunk.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          // Skip SSE event lines
          if (line.startsWith('event:')) continue;

          // Handle SSE data lines
          let jsonStr = line;
          if (line.startsWith('data:')) {
            jsonStr = line.substring(5).trim();
          }

          // Also handle old format: "0:data\n"
          const match = jsonStr.match(/^\d+:(.+)$/);
          if (match) {
            jsonStr = match[1];
          }

          if (jsonStr.startsWith('{') || jsonStr.startsWith('[')) {
            const data = JSON.parse(jsonStr);

            // Handle AI SDK v5 data format: { type: "data", value: [...] }
            if (data.type === 'data' && Array.isArray(data.value)) {
              for (const item of data.value) {
                if (item.type === 'activity') {
                  activityCount++;
                  const status = item.content?.status || 'unknown';
                  const message = item.content?.message || '';
                  activities.push({ status, message });
                  const icon = status === 'complete' ? '✓' : status === 'pending' ? '○' : '!';
                  console.log(`    ${icon} ${message}`);
                } else if (item.type === 'report') {
                  reportReceived = true;
                  finalReport = item.content || '';
                }
              }
            }
            // Also handle direct format (for backwards compatibility)
            else if (data.type === 'activity') {
              activityCount++;
              const status = data.content?.status || 'unknown';
              const message = data.content?.message || '';
              activities.push({ status, message });
              const icon = status === 'complete' ? '✓' : status === 'pending' ? '○' : '!';
              console.log(`    ${icon} ${message}`);
            } else if (data.type === 'report') {
              reportReceived = true;
              finalReport = data.content || '';
            }
          }
        } catch {
          // Not JSON, skip
        }
      }
    }

    console.log(`\n  📊 Summary:`);
    console.log(`    Activities: ${activityCount}`);
    console.log(`    Report: ${reportReceived ? '✓ Received' : '✗ Not received'}`);

    // Show final report if received
    if (finalReport) {
      console.log('\n' + '═'.repeat(50));
      console.log('📄 Final Research Report');
      console.log('═'.repeat(50));
      console.log(finalReport);
      console.log('═'.repeat(50));
    }

    if (activityCount > 0 && reportReceived) {
      console.log('\n  ✅ Deep Research: PASSED');
      return true;
    } else if (activityCount > 0) {
      console.log('\n  ⚠️  Deep Research: Partial (activities but no report)');
      return false;
    } else {
      console.log('\n  ❌ Deep Research: FAILED (no activities parsed)');
      // Debug: show first part of raw response
      if (fullResponse.length > 0) {
        console.log('\n  Debug - First 500 chars of response:');
        console.log(`    ${fullResponse.substring(0, 500)}`);
      }
      return false;
    }
  } catch (error) {
    console.error('  ❌ Test failed:', error);
    return false;
  }
}

async function checkServerRunning() {
  try {
    const response = await fetch(BASE_URL, { method: 'HEAD' });
    return response.ok || response.status === 405; // 405 is OK, just means method not allowed
  } catch {
    return false;
  }
}

async function main() {
  console.log('🚀 Deep Research API Test Suite');
  console.log('═'.repeat(50));
  console.log(`Base URL: ${BASE_URL}`);

  // Check if server is running
  const serverRunning = await checkServerRunning();
  if (!serverRunning) {
    console.error('\n❌ Server not running!');
    console.error('   Start the dev server first: npm run dev');
    process.exit(1);
  }

  console.log('✓ Server is running');

  const results: boolean[] = [];

  results.push(await testGenerateQuestions());
  results.push(await testDeepResearch());

  console.log('\n' + '═'.repeat(50));
  console.log('📊 Summary');
  console.log('─'.repeat(50));

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`Passed: ${passed}/${total}`);

  if (passed === total) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed');
  }
}

main().catch(console.error);
````

## File: scripts/test-foundry-websearch.ts
````typescript
/**
 * Test Foundry Web Search Function
 * 
 * Tests the webSearch function directly to verify Foundry integration.
 * 
 * Usage: npx tsx scripts/test-foundry-websearch.ts
 */

// Load environment variables from .env.local or .envrc (if using direnv, vars are already loaded)
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Try .env.local first, then .envrc (though direnv should already load .envrc)
const envLocal = resolve(process.cwd(), '.env.local');
const envrc = resolve(process.cwd(), '.envrc');
if (existsSync(envLocal)) {
  config({ path: envLocal });
} else if (existsSync(envrc)) {
  config({ path: envrc });
}

import { executeFoundrySearch } from '../src/app/api/deep-research/foundry-tools';

async function testWebSearch() {
  console.log('\n🧪 Testing Foundry Web Search Function');
  console.log('═'.repeat(60));
  
  // Check environment variables
  console.log('\n📋 Environment Check:');
  console.log('─'.repeat(60));
  const token = process.env.FOUNDRY_TOKEN;
  const baseUrl = process.env.FOUNDRY_BASE_URL;
  const ontologyApiName = process.env.FOUNDRY_ONTOLOGY_API_NAME;
  const functionName = process.env.FOUNDRY_WEB_SEARCH_FUNCTION_NAME;
  const ontologyRid = process.env.FOUNDRY_ONTOLOGY_RID;

  console.log(`FOUNDRY_TOKEN: ${token ? '✓ Set (' + token.substring(0, 20) + '...)' : '❌ Missing'}`);
  console.log(`FOUNDRY_BASE_URL: ${baseUrl || '✓ Using default'}`);
  console.log(`FOUNDRY_ONTOLOGY_API_NAME: ${ontologyApiName ? '✓ ' + ontologyApiName : '❌ Missing'}`);
  console.log(`FOUNDRY_ONTOLOGY_RID: ${ontologyRid ? '✓ Set' : '❌ Missing'}`);
  console.log(`FOUNDRY_WEB_SEARCH_FUNCTION_NAME: ${functionName || '✓ Using default (searchWebBatch)'}`);

  if (!token) {
    console.error('\n❌ FOUNDRY_TOKEN is required!');
    console.error('   Make sure .envrc is loaded or export the variable');
    process.exit(1);
  }

  if (!ontologyApiName) {
    console.error('\n❌ FOUNDRY_ONTOLOGY_API_NAME is required!');
    console.error('   Set it in .envrc (e.g., ontology-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)');
    process.exit(1);
  }
  
  // Test with a simple query
  const testQuery = 'artificial intelligence';
  console.log(`\n🔍 Testing with query: "${testQuery}"`);
  console.log('─'.repeat(60));
  
  try {
    const startTime = Date.now();
    
    const results = await executeFoundrySearch(testQuery);
    
    const elapsed = Date.now() - startTime;
    
    console.log(`\n✅ Function call completed in ${elapsed}ms`);
    console.log(`\n📊 Results (${results.length} sources):`);
    console.log('─'.repeat(60));
    
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.title} (${result.url})`);
      console.log(`   Content length: ${result.content.length} chars`);
      
      // Show first 200 chars of content
      const preview = result.content.substring(0, 200);
      console.log(`   Preview: ${preview}...`);
      
      // Check if it's mock data
      if (result.content.includes('Mock') || result.content.includes('placeholder')) {
        console.log('   ⚠️  WARNING: This appears to be mock data');
      } else {
        console.log('   ✅ Real Foundry data!');
      }
    });
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ Test completed successfully!');
    
    return true;
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('─'.repeat(60));
    console.error(error);
    
    if (error instanceof Error) {
      console.error(`\nError message: ${error.message}`);
      console.error(`\nStack trace: ${error.stack}`);
    }
    
    return false;
  }
}

// Run the test
testWebSearch()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
````

## File: src/app/api/deep-research/constants.ts
````typescript
// Research constants
export const MAX_ITERATIONS = 3; // Maximum number of iterations
export const MAX_SEARCH_RESULTS = 5; // Maximum number of search results
export const MAX_CONTENT_CHARS = 20000; // Maximum number of characters in the content
export const MAX_RETRY_ATTEMPTS = 3; // It is the number of times the model will try to call LLMs if it fails
export const RETRY_DELAY_MS = 1000; // It is the delay in milliseconds between retries for the model to call LLMs

// Model names (Foundry model identifiers)
export const MODELS = {
  PLANNING: "GPT_5",
  EXTRACTION: "GPT_5",
  ANALYSIS: "GPT_5",
  REPORT: "GPT_5",
};
````

## File: src/app/api/deep-research/main.ts
````typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createActivityTracker } from "./activity-tracker";
import { MAX_ITERATIONS } from "./constants";
import { analyzeFindings, generateReport, generateSearchQueries, processSearchResults, search } from "./research-functions";
import { ResearchState } from "./types";


export async function deepResearch(researchState: ResearchState, dataStream: any){

    let iteration = 0;
    
    const activityTracker = createActivityTracker(dataStream, researchState);

    const initialQueries = await generateSearchQueries(researchState, activityTracker)
    let currentQueries = (initialQueries as any).searchQueries
    while(currentQueries && currentQueries.length > 0 && iteration <=  MAX_ITERATIONS){
        iteration++;

        console.log("We are running on the itration number: ", iteration);

        const searchResults = currentQueries.map((item: { query: string; source: "web" | "ontology" }) =>
          search(item.query, item.source, researchState, activityTracker)
        );
        const searchResultsResponses = await Promise.allSettled(searchResults)

        const allSearchResults = searchResultsResponses.filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled' && result.value.length > 0).map(result => result.value).flat()

        console.log(`We got ${allSearchResults.length} search results!`)

const newFindings = await processSearchResults(
    allSearchResults, researchState, activityTracker
)

console.log("Results are processed!")

researchState.findings = [...researchState.findings, ...newFindings]

const analysis = await analyzeFindings(
    researchState,
    currentQueries,
    iteration, 
    activityTracker
)

console.log("Analysis: ", analysis)

if((analysis as any).sufficient){
    break;
}


        currentQueries = ((analysis as any).queries || []).filter(
          (item: { query: string; source: string }) =>
            !currentQueries.some((existing: { query: string }) => existing.query === item.query)
        );
    }

    console.log("We are outside of the loop with total iterations: ", iteration)

    const report = await generateReport(researchState, activityTracker);

    dataStream.writeData({
        type: "report",
        content: report
    })

    // console.log("REPORT: ", report)

    return initialQueries;

}
````

## File: .env.example
````
# Foundry Configuration
# For direnv users: See .envrc.example instead
FOUNDRY_TOKEN=your-foundry-token-here
FOUNDRY_BASE_URL=https://northslope.palantirfoundry.com

# Foundry Ontology Configuration (required for ontology search)
# To find your ontology RID:
# 1. Navigate to your Ontology in Foundry
# 2. Copy the RID from the URL or use the MCP tool 'get_foundry_ontology_rid'
FOUNDRY_ONTOLOGY_RID=ri.ontology.main.ontology.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Ontology API Name (used in URLs, without ri. prefix)
FOUNDRY_ONTOLOGY_API_NAME=ontology-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Function name for web search (Ontology Query function name)
FOUNDRY_WEB_SEARCH_FUNCTION_NAME=searchWebBatch
````

## File: .gitignore
````
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env.local
.env.development
.env.production
.env
.envrc

# project-specific
PLAN.md

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
````

## File: src/app/api/deep-research/research-functions.ts
````typescript
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

export async function generateSearchQueries(
  researchState: ResearchState,
  activityTracker: ActivityTracker
) {
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

  activityTracker.add("planning", "complete", "Crafted the research plan");

  return result;
  }catch(error){
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
  activityTracker.add("search", "pending", `Searching ${sourceLabel} for ${query}`);

  try {
    let content: string;
    let title: string;
    let url: string;

    if (source === "web") {
      content = await webSearch(query);
      title = "Web Results";
      url = "Firecrawl";
    } else {
      content = await ontologySearch(query);
      title = "Ontology Results";
      url = "Foundry";
    }

    researchState.completedSteps++;

    activityTracker.add("search", "complete", `Found ${sourceLabel} results for ${query}`);

    return [{ title, url, content }];
  } catch (error) {
    console.log("error: ", error);
    return handleError(error, `Searching ${sourceLabel} for ${query}`, activityTracker, "search", []) || [];
  }
}

export async function extractContent(
  content: string,
  url: string,
  researchState: ResearchState,
  activityTracker: ActivityTracker
) {

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
      
        activityTracker.add("extract","complete",`Extracted content from ${url}`);
      
        return {
          url,
          summary: (result as any).summary,
        };
    }catch(error){
        return handleError(error, `Content extraction from ${url}`, activityTracker, "extract", null) || null
    }
}

export async function processSearchResults(
  searchResults: SearchResult[],
  researchState: ResearchState,
  activityTracker: ActivityTracker
): Promise<ResearchFindings[]> {
  const extractionPromises = searchResults.map((result) =>
    extractContent(result.content, result.url, researchState, activityTracker)
  );
  const extractionResults = await Promise.allSettled(extractionPromises);

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

  return newFindings;
}

export async function analyzeFindings(
  researchState: ResearchState,
  currentQueries: string[],
  currentIteration: number,
  activityTracker: ActivityTracker
) {
  try {
    activityTracker.add("analyze","pending",`Analyzing research findings (iteration ${currentIteration}) of ${MAX_ITERATIONS}`);
    const contentText = combineFindings(researchState.findings);

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

    activityTracker.add("analyze","complete",`Analyzed collected research findings: ${isContentSufficient ? 'Content is sufficient' : 'More research is needed!'}`);

    return result;
  } catch (error) {
    return handleError(error, `Content analysis`, activityTracker, "analyze", {
        sufficient: false,
        gaps: ["Unable to analyze content"],
        queries: [{ query: "Please try a different search query", source: "web" }]
    })
  }
}

export async function generateReport(researchState: ResearchState, activityTracker: ActivityTracker) {
  try {
    activityTracker.add("generate","pending",`Geneating comprehensive report!`);

    const contentText = combineFindings(researchState.findings);

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

    activityTracker.add("generate","complete",`Generated comprehensive report, Total tokens used: ${researchState.tokenUsed}. Research completed in ${researchState.completedSteps} steps.`);

    return report;
  } catch (error) {
    console.log(error);
    return handleError(error, `Report Generation`, activityTracker, "generate", "Error generating report. Please try again. ")
  }
}
````

## File: src/app/api/deep-research/prompts.ts
````typescript
export const EXTRACTION_SYSTEM_PROMPT = `
You are a precision data analyst. Your job is to extract concrete facts and entities.

## Internal Ontology Extraction Rules

When processing [INTERNAL DATA] (JSON), do NOT describe the schema or the search process. Extract the ACTUAL ENTITIES found.

1. **Entity Identification**:
   - Identify specific people, projects, documents, or resources.
   - If you see ID fields (like 'resourceId', 'ownerId', 'personId'), capture them explicitly. These are critical for follow-up searches.
   - **Crucial**: If the search returns "Temporary Locations" or metadata records, extract the linked IDs (e.g., 'resourceId') so we can find the actual person later.

2. **Relevance Filter**:
   - If the results contains 0 items, simply output: "No internal matches found."
   - Do NOT write paragraphs explaining *why* it wasn't found.

3. **Output Format**:
   - Return a clean Markdown list of entities found.
   - Include RIDs and properties.
   - **Bad**: "The search looked for T6Resource and found nothing."
   - **Good**: "Found Entity: Project Alpha (Status: Active, Owner: Bob)."
`;

export const getExtractionPrompt = (content: string, topic: string, clarificationsText: string) =>
  `Extract relevant entities and facts from this content.
  Topic: <topic>${topic}</topic>
  Clarifications: <clarifications>${clarificationsText}</clarifications>
  Content: <content>${content}</content>`;


export const ANALYSIS_SYSTEM_PROMPT = `
You are a Research Strategist. Your goal is to pivot the search strategy based on findings until you have the ANSWER, not a plan.

## Critical Analysis Logic

1. **Dead Ends vs. Clues**:
   - If a search returns 0 results, do NOT keep searching for the same terms. Pivot.
   - **The "Pivot" Rule**: If you search for "Resumes" and find nothing, search for "Employees" or "KeyPeople" instead. If you find "Locations", search for the "resourceId" listed in that location to find the Person.

2. **Entity Traversal (The "Hop")**:
   - If you find an object that *links* to what you want (e.g., a "Travel Record" containing a "resourceId"), your NEXT query MUST be for that ID.
   - Example: Found T6TemporaryLocation with resourceId: 'res-123'. Next Query -> "res-123" (source: ontology).

3. **Sufficiency Check**:
   - **Sufficient**: You have found the specific entities asked for (e.g., actual Resumes or Person Profiles).
   - **Not Sufficient**: You only have metadata (Locations, Logs) or general web info.

## Output JSON Format
{
  "sufficient": boolean,
  "gaps": ["Specific missing details"],
  "queries": ["Next query 1", "Next query 2"]
}

IMPORTANT: If you haven't found the specific answer yet, do NOT mark as sufficient. Keep digging or changing search terms.
`;

export const getAnalysisPrompt = (contentText: string, topic: string, clarificationsText: string, currentQueries: string[], currentIteration: number, maxIterations: number, findingsLength: number) =>
  `Analyze the research progress.
   Topic: ${topic}
   Clarifications: ${clarificationsText}
   Current Findings Length: ${contentText.length} chars
   Distinct Findings: ${findingsLength}
   Current Iteration: ${currentIteration}/${maxIterations}
   Previous Queries: ${currentQueries.join(", ")}

   Determine next steps. If we have only found metadata (like Locations) but need People/Resumes, create specific queries for the IDs found in the metadata.`;


export const PLANNING_SYSTEM_PROMPT = `
You are a Senior Researcher. Your job is to generate diverse search queries to find the requested information from Internal (Ontology) and External (Web) sources.

## Search Strategy

1. **Internal Ontology (Company Data)**
   - Use this for: People, Projects, Resumes, Tickets, Customers.
   - **Search Logic**: If looking for people/resumes, search for:
     - "Resume", "CV", "Candidate", "Profile"
     - "Forward Deployed Engineer", "Software Engineer" (Job Titles)
     - Skills: "Python", "TypeScript", "Palantir"

2. **External Web (Firecrawl)**
   - Use this for: Industry standards, job descriptions, tech stack details, competitor info.

## Query Generation Rules
- Generate 2-4 specific queries.
- If the user asks for "Resumes", explicitly search for "Resume" and "Candidate" in the Ontology source.
- Do not be vague. "Data" is bad. "FDE Candidate Resumes" is good.
`;

export const getPlanningPrompt = (topic: string, clarificationsText: string) =>
  `Generate a research plan for: ${topic}
   Context/Clarifications: ${clarificationsText}`;


export const REPORT_SYSTEM_PROMPT = `
You are a Senior Research Analyst producing comprehensive, evidence-based reports.

## Core Principles

1. **Answer First**: Lead with findings, not methodology.
2. **Source Transparency**: Every claim must trace back to a source (RID or URL).
3. **Critical Analysis**: Don't just summarize—synthesize, evaluate, and identify patterns.
4. **Actionable Output**: Reports should enable decisions, not just inform.

## STRICT RULES

- **NO Implementation Plans**: Do NOT write about how to find data or what engineering work is needed.
- **NO Meta-Commentary**: Do NOT describe "what we searched" or "the strategy we used."
- **Fail Gracefully**: If no relevant data was found, state it clearly in 1-2 sentences. Do not pad with filler content.

## Report Structure

Use this structure. Omit sections that have no content (e.g., skip "Internal Findings" if nothing was found internally).

---

# [Topic Title]

## Executive Summary
- **Key Finding 1**: (One sentence with the most important insight)
- **Key Finding 2**: (Second most important)
- **Key Finding 3**: (Third, if applicable)
- **Bottom Line**: (What should the reader do with this information?)

## Internal Findings
Present entities discovered from internal data sources. Use tables for structured data.

| Entity | Type | Key Attributes | Relevance |
|--------|------|----------------|-----------|
| Name/ID | Object Type | Important properties | Why it matters |

For each significant entity, provide:
- **Overview**: What is this entity?
- **Key Data Points**: Relevant properties and values
- **Connections**: Links to other entities if discovered

## External Context
Synthesize findings from web sources. Group by theme, not by source.

### [Theme 1: e.g., Industry Standards]
- Key insight from external research
- Supporting evidence with source attribution

### [Theme 2: e.g., Best Practices]
- Key insight
- Supporting evidence

## Analysis

### Source Reliability Assessment
| Source | Type | Credibility | Potential Bias | Notes |
|--------|------|-------------|----------------|-------|
| Source name | Internal/External | High/Med/Low | Any bias noted | Brief note |

### Synthesis
- **Patterns Identified**: What themes emerge across sources?
- **Contradictions**: Any conflicting information? How resolved?
- **Confidence Level**: How confident are we in these findings? (High/Medium/Low with justification)

## Spikes, Risks & Bets

### Spikes (Areas Requiring Further Investigation)
- **Spike 1**: [Description] — *Why*: [Justification]
- **Spike 2**: [Description] — *Why*: [Justification]

### Risks (Potential Issues or Concerns)
- **Risk 1**: [Description] — *Impact*: [High/Med/Low] — *Mitigation*: [Suggested action]
- **Risk 2**: [Description] — *Impact*: [High/Med/Low] — *Mitigation*: [Suggested action]

### Bets (Recommended Actions or Hypotheses)
- **Bet 1**: [Recommendation] — *Confidence*: [High/Med/Low] — *Rationale*: [Why]
- **Bet 2**: [Recommendation] — *Confidence*: [High/Med/Low] — *Rationale*: [Why]

## Information Gaps
List specific questions that remain unanswered:
- Gap 1: [What's missing and why it matters]
- Gap 2: [What's missing and why it matters]

## Sources

### Internal Sources
| RID | Entity Type | Used For |
|-----|-------------|----------|
| ri.xxx.xxx | Type | What finding it supports |

### External Sources
- [Source Title](URL) — Used for: [What finding it supports]

---

## Formatting Guidelines

- Use **bold** for key terms and important findings
- Use tables for structured comparisons and entity listings
- Use bullet points for lists
- Use blockquotes for direct quotations from sources
- Keep paragraphs concise (3-4 sentences max)
- Every factual claim needs a source attribution
- Don't use long RIDs, for example Phonograph RIDs like ri.phonograph2-objects.main.object.xxxxx.

Remember: The report should enable the reader to make decisions. If you found candidates, evaluate them. If you found risks, assess them. If you found nothing, say so clearly and move on.
`;

export const getReportPrompt = (contentText: string, topic: string, clarificationsText: string) =>
  `Write the final research report.

Topic: ${topic}

Context/Clarifications: ${clarificationsText}

Research Findings:
${contentText}

Instructions:
1. Follow the report structure exactly
2. If findings are empty or irrelevant, state "No matching results found" in the Executive Summary and keep the report brief
3. Every claim must reference a source from the findings
4. Focus on actionable insights, not descriptions of the research process
5. Include Spikes/Risks/Bets analysis for any significant entities found`;
````

## File: README.md
````markdown
# Deep Research AI Agent

A powerful deep research agent that leverages **Palantir Foundry's Language Model Service** to conduct comprehensive research across both internal ontology data and external web sources.

## Overview

This agent generates follow-up questions, crafts optimal search queries, and compiles comprehensive research reports through an iterative research loop. It seamlessly integrates both company-specific data from your Foundry Ontology and public web information to provide complete, contextualized research.

## Key Features

- **Dual-Source Search**: Simultaneously queries Foundry Ontology (internal) and Web (external) sources
- **Intelligent Query Generation**: Creates diverse, targeted queries optimized for both data sources
- **Iterative Research Loop**: Analyzes findings and generates follow-up queries to fill gaps
- **Structured Ontology Integration**: Extracts entities, properties, and relationships from Foundry
- **Comprehensive Reporting**: Generates detailed markdown reports with clear source attribution
- **Real-time Streaming**: See research progress as it happens

## Tech Stack

- **Framework**: Next.js 15 (App Router with Turbopack)
- **AI Integration**: Vercel AI SDK with `@northslopetech/foundry-ai-sdk`
- **Data Platform**: Palantir Foundry (Ontology API + LLM Service)
- **Styling**: Tailwind CSS, Shadcn UI
- **Language**: TypeScript

## Prerequisites

Before you begin, ensure you have:

- Access to Palantir Foundry instance
- Foundry API token with appropriate permissions
- Your Foundry Ontology RID

## Setup Instructions

### 1. Clone the Repository

```bash
git clone [repo-url]
cd Deep-Research-AI-Agent
```

### 2. Install Dependencies

> **NOTE:** Use the `--legacy-peer-deps` flag if you encounter dependency issues.

```bash
npm install --legacy-peer-deps
```

### 3. Environment Variables

Create a `.env.local` file (or `.envrc` if using direnv) with the following:

```bash
FOUNDRY_TOKEN=your_foundry_api_token
FOUNDRY_BASE_URL=https://your-instance.palantirfoundry.com
FOUNDRY_ONTOLOGY_RID=ri.ontology.main.ontology.xxxxxxxx
```

To find your Ontology RID:
1. Navigate to your Ontology in Foundry
2. Copy the RID from the URL
3. Or use: `get_foundry_ontology_rid` if you have the Palantir MCP tool configured

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to use the research agent.

## Available Commands

```bash
npm run dev         # Start dev server with Turbopack
npm run build       # Production build
npm run lint        # Run ESLint
npm run test:api    # Test Foundry API connection
npm run test:ontology  # Test ontology query functionality
```

## How It Works

The research agent follows an iterative loop:

1. **Planning**: Generates diverse search queries for both Ontology and Web sources
2. **Search**: Executes queries against both sources simultaneously
3. **Extract**: Summarizes and structures results from each source
4. **Analyze**: Determines if findings are sufficient or generates follow-up queries
5. **Report**: Compiles comprehensive markdown report with source attribution

### Search Strategy

The agent uses a dual-source approach:

- **Ontology Search**: Queries internal company data, entities, and relationships
- **Web Search**: Retrieves public information, best practices, and external context

Results are clearly attributed, and the agent iteratively refines queries based on what it discovers in each source.

## Documentation

See `CLAUDE.md` for detailed technical documentation including:
- Architecture overview
- Research flow details
- Foundry provider constraints
- Tool implementation
- Testing procedures

## Project Structure

```
├── src/
│   ├── app/
│   │   └── api/deep-research/    # Research agent API
│   ├── components/ui/             # UI components
│   ├── lib/                       # Core libraries
│   │   ├── foundry-provider.ts   # Foundry AI SDK setup
│   │   └── foundry-client.ts     # Ontology API client
│   └── store/                     # State management
├── scripts/                       # Testing scripts
└── docs/                          # Additional documentation
```

## License

MIT
````

## File: src/app/api/deep-research/foundry-tools.ts
````typescript
/**
 * Foundry search tools - Web search and Ontology search
 */

import { searchOntologyObjects, listObjectTypes as listOntologyObjectTypes } from '@/lib/foundry-client';

/**
 * Call a Foundry Ontology Query function via HTTP
 * Uses service user token (FOUNDRY_TOKEN) for authentication.
 *
 * @param functionName - The name of the Ontology Query function (e.g., 'searchWebBatch')
 * @param parameters - Parameters to pass to the function
 */
async function callFoundryFunction(
  functionName: string,
  parameters: Record<string, unknown>
): Promise<unknown> {
  const url = process.env.FOUNDRY_BASE_URL || "https://northslope.palantirfoundry.com";
  const token = process.env.FOUNDRY_TOKEN;
  const ontologyApiName = process.env.FOUNDRY_ONTOLOGY_API_NAME;

  if (!token) {
    throw new Error("FOUNDRY_TOKEN environment variable is required");
  }

  if (!ontologyApiName) {
    throw new Error("FOUNDRY_ONTOLOGY_API_NAME environment variable is required");
  }

  // Use Ontology Query endpoint format with API name (not full RID)
  const functionUrl = `${url}/api/v2/ontologies/${ontologyApiName}/queries/${functionName}/execute`;
  console.log(`[Foundry] Calling: ${functionUrl}`);

  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ parameters }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

/**
 * Web search via Foundry Ontology Query
 * Calls the Ontology Query function specified in FOUNDRY_WEB_SEARCH_FUNCTION_NAME
 *
 * The function expects: { queries: string[] }
 * Returns: JSON string with { success, totalQueries, searchResults: [...] }
 */
export async function webSearch(query: string): Promise<string> {
  const functionName = process.env.FOUNDRY_WEB_SEARCH_FUNCTION_NAME || "searchWebBatch";

  // Debug logging
  console.log("[DEBUG] FOUNDRY_WEB_SEARCH_FUNCTION_NAME:", functionName);
  console.log("[DEBUG] All FOUNDRY_ env vars:", Object.keys(process.env).filter(k => k.startsWith('FOUNDRY_')).map(k => `${k}=${process.env[k]?.substring(0, 20)}...`));

  try {
    console.log(`[Foundry] Calling web search function: ${functionName} with query: ${query}`);

    // Function expects queries as an array: { queries: string[] }
    const result = await callFoundryFunction(functionName, { queries: [query] });
    
    // The function returns a JSON string, which may be wrapped in a "value" field for ontology queries
    // Handle ontology query response format (wrapped in "value" field)
    let resultString: string;
    if (typeof result === 'object' && result !== null && 'value' in result) {
      resultString = (result as { value: string }).value;
    } else if (typeof result === 'string') {
      resultString = result;
    } else {
      resultString = JSON.stringify(result);
    }
    
    // Parse the JSON string
    const parsedResult: {
      success?: boolean;
      totalQueries?: number;
      searchResults?: Array<{
        query: string;
        success: boolean;
        results: unknown[];
        error: string | null;
      }>;
      error?: string;
      details?: string;
    } = JSON.parse(resultString);
    
    // Extract results from the first search result (since we only sent one query)
    if (parsedResult.searchResults && parsedResult.searchResults.length > 0) {
      const firstResult = parsedResult.searchResults[0];
      
      if (firstResult.success && firstResult.results && firstResult.results.length > 0) {
        // Return the results in the expected format
        return JSON.stringify({
          success: true,
          results: firstResult.results,
        }).slice(0, 15000);
      } else if (firstResult.error) {
        // Return error from the function
        return JSON.stringify({
          error: firstResult.error,
          query,
        }).slice(0, 15000);
      }
    }
    
    // If we get here, something unexpected happened
    if (parsedResult.error) {
      return JSON.stringify({
        error: parsedResult.error,
        details: parsedResult.details,
        query,
      }).slice(0, 15000);
    }
    
    // Fallback: return the full response
    return JSON.stringify(parsedResult).slice(0, 15000);
  } catch (error) {
    console.error(`[Foundry] Web search error:`, error);
    // Return error information in a structured format
    return JSON.stringify({
      error: "Foundry function call failed",
      message: error instanceof Error ? error.message : String(error),
      query,
    }).slice(0, 15000);
  }
}

/**
 * Ontology search via Palantir Foundry Ontology API
 * Searches across ontology objects and returns relevant results
 */
export async function ontologySearch(query: string): Promise<string> {
  try {
    console.log(`[LIVE] Ontology search for: ${query}`);

    // Call the Foundry Ontology API with auto-discover enabled
    // This will automatically search across available object types
    const response = await searchOntologyObjects(query, {
      maxResults: 10,
      autoDiscover: true, // Automatically discover and search object types
    });

    // Check if ontology search is configured
    if (response.message === 'Ontology search not configured') {
      return `[INTERNAL DATA - Not Configured]
Ontology search is not configured. Set FOUNDRY_ONTOLOGY_RID environment variable to enable internal data search.`;
    }

    // Format the results for the research agent
    const formattedResults = {
      query,
      totalCount: response.totalCount || 0,
      searchedTypes: response.searchedTypes || [],
      results: response.data?.map((obj) => ({
        rid: obj.rid,
        properties: obj.properties,
      })) || [],
      hasMore: !!response.nextPageToken,
    };

    // Truncate to stay within context limits (as per CLAUDE.md)
    const jsonString = JSON.stringify(formattedResults, null, 2);
    const truncated = jsonString.slice(0, 15000);

    return `[INTERNAL DATA - Foundry Ontology]\n${truncated}${
      jsonString.length > 15000 ? '\n...(truncated)' : ''
    }`;
  } catch (error) {
    console.error('Error querying Foundry Ontology:', error);

    // Fallback to a helpful error message
    return `[INTERNAL DATA - Error]
Failed to query Foundry Ontology for: "${query}"
Error: ${error instanceof Error ? error.message : 'Unknown error'}

This might be due to:
- Missing FOUNDRY_ONTOLOGY_RID environment variable
- Invalid authentication token
- Network connectivity issues
- Ontology configuration issues

Please check your environment configuration.`;
  }
}

/**
 * List available object types in the Ontology
 * Returns array of object type names (e.g., ["Employee", "Project", "Upload"])
 */
export async function listObjectTypes(): Promise<string[]> {
  const ontologyRid = process.env.FOUNDRY_ONTOLOGY_RID;

  if (!ontologyRid) {
    console.warn('[listObjectTypes] FOUNDRY_ONTOLOGY_RID not set');
    return [];
  }

  try {
    const types = await listOntologyObjectTypes(ontologyRid);
    return types;
  } catch (error) {
    console.error('[listObjectTypes] Error:', error);
    return [];
  }
}

/**
 * Execute both search tools and combine results.
 * Returns SearchResult[] format expected by research-functions.ts
 * @deprecated Use webSearch() and ontologySearch() separately instead
 */
export async function executeFoundrySearch(query: string) {
  const [webRes, ontologyRes] = await Promise.all([
    webSearch(query),
    ontologySearch(query),
  ]);

  return [
    { title: "Web Results", url: "Firecrawl", content: webRes },
    { title: "Internal Ontology", url: "Palantir", content: ontologyRes },
  ];
}
````

## File: package.json
````json
{
  "name": "deep-research-ai-agent",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test:api": "tsx scripts/test-api.ts",
    "test:foundry": "tsx scripts/test-foundry-direct.ts",
    "test:ontology": "tsx scripts/test-ontology-query.ts",
    "test:websearch": "tsx scripts/test-foundry-websearch.ts"
  },
  "dependencies": {
    "@ai-sdk/react": "^2.0.109",
    "@deep-research-service-user/sdk": "^0.1.0",
    "@hookform/resolvers": "^4.1.3",
    "@northslopetech/foundry-ai-sdk": "^0.2.0",
    "@opentelemetry/api": "^1.9.0",
    "@osdk/client": "^2.5.2",
    "@osdk/foundry": "latest",
    "@osdk/oauth": "^1.0.0",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-collapsible": "^1.1.3",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.1.8",
    "ai": "^5.0.108",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "exa-js": "^1.5.11",
    "lucide-react": "^0.477.0",
    "next": "15.2.4",
    "next-themes": "^0.4.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.54.2",
    "react-markdown": "^10.1.0",
    "react-syntax-highlighter": "^15.6.1",
    "remark-gfm": "^4.0.1",
    "sonner": "^2.0.1",
    "tailwind-merge": "^3.0.2",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^4.1.13",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@tailwindcss/typography": "^0.5.16",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/react-syntax-highlighter": "^15.5.13",
    "eslint": "^9",
    "eslint-config-next": "15.2.1",
    "tailwindcss": "^4",
    "tsx": "^4.21.0",
    "typescript": "^5"
  }
}
````
