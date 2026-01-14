searchWebBatch
Latest
View Web Search Repo

TypeScript

2.6
Documentation
Batch web search function - executes multiple search queries simultaneously Uses Promise.all() for parallel execution to save time
Inputs
Name	Type	Description
queries
Required
List[String]
- Array of search queries to execute in parallel
Output
Return type
String
Executing searchWebBatch
To execute this function, pass the inputs as parameters.

Parameters
queries
string[]
"- Array of search queries to execute in parallel"
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/queries/searchWebBatch/execute
// Edit this import if your client location differs
import { client } from "./client";
import { searchWebBatch } from "@gmahler-deep-research-service-user/sdk";

const result = await client(searchWebBatch).executeFunction({
    "queries": "value"
});