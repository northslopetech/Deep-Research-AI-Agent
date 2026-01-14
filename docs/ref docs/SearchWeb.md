searchWeb
Latest
View Web Search Repo

TypeScript

2.6
Documentation
Web search function using Firecrawl API /v1/search endpoint Returns search results with optional scraped markdown content
Inputs
Name	Type	Description
query
Required
String
- The search query
Output
Return type
String
Executing searchWeb
To execute this function, pass the inputs as parameters.

Parameters
query
string
"- The search query"
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/queries/searchWeb/execute
// Edit this import if your client location differs
import { client } from "./client";
import { searchWeb } from "@gmahler-deep-research-service-user/sdk";

const result = await client(searchWeb).executeFunction({
    "query": "value"
});