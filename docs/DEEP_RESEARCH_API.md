# Deep Research API

## Endpoint

```
POST /api/deep-research
```

## Request Format

```typescript
{
  messages: [{
    role: "user",
    content: JSON.stringify({
      topic: string,                    // Required: Research topic
      clarifications: Array<{           // Required: User's answers to clarifying questions
        question: string,
        answer: string
      }>,
      objectTypes?: string[]            // Optional: Array of Foundry object type API names
    })
  }]
}
```

## objectTypes Parameter

When `objectTypes` is provided, the ontology search will **only** query those specific object types instead of auto-discovering all available types.

### Examples

**Without objectTypes** (searches all accessible types):
```javascript
const response = await fetch('/api/deep-research', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{
      role: 'user',
      content: JSON.stringify({
        topic: 'Find employees with Python experience',
        clarifications: [
          { question: 'What department?', answer: 'Engineering' }
        ]
      })
    }]
  })
});
```

**With objectTypes** (searches only specified types):
```javascript
const response = await fetch('/api/deep-research', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{
      role: 'user',
      content: JSON.stringify({
        topic: 'Find employees with Python experience',
        clarifications: [
          { question: 'What department?', answer: 'Engineering' }
        ],
        objectTypes: ['Employee', 'Resume', 'SkillProfile']
      })
    }]
  })
});
```

## Response

Streaming response using AI SDK v5's `createUIMessageStream`. The stream includes:

- `type: "data"` - Activity updates (search progress, extraction status)
- `type: "report"` - Final research report (markdown)

## Notes

- `objectTypes` values must match exact Foundry object type API names (case-sensitive)
- If all specified types are inaccessible (permission denied), returns empty results
- Empty array `[]` is treated the same as omitting the parameter (auto-discover)
