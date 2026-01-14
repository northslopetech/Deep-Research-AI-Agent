searchWebWithContent
Latest
View Web Search Repo

TypeScript

2.6
Documentation
Search with content scraping - slower but returns markdown content Use only when you actually need the page content, not just search results
Inputs
Name	Type	Description
query
Required
String
- The search query
Output
Return type
String
Executing searchWebWithContent
To execute this function, pass the inputs as parameters.

Parameters
query
string
"- The search query"
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/queries/searchWebWithContent/execute
// Edit this import if your client location differs
import { client } from "./client";
import { searchWebWithContent } from "@gmahler-deep-research-service-user/sdk";

const result = await client(searchWebWithContent).executeFunction({
    "query": "value"
});