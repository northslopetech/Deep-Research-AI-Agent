[DeepResearch] Create Deep Research Session With ID Action

Description
No description
Parameters
Name
Parameter ID
Type	Description
Id	id	
String
No description
Current User	currentUser	
String
No description
Query	query	
String
No description
Report	report	
String
No description
Title	title	
String
No description
Apply deep-research-create-deep-research-session-with-id-action
To apply this Action, fill in the input parameter values.

Parameters
parameters
object
Map of parameter ID to values to use for those input parameters.
Show child parameters
id
string
No description provided.
currentUser
string
No description provided.
query
string
No description provided.
report
string
No description provided.
title
string
No description provided.
options
ApplyActionRequestOptions
(optional)
Additional options to pass to the request.
Show child parameters
mode
"VALIDATE_ONLY" | "VALIDATE_AND_EXECUTE"
= "VALIDATE_AND_EXECUTE"
Whether to only validate the Action parameters, or to validate and apply the Action.
returnEdits
"ALL" | "NONE"
= "NONE"
Whether the edits are returned in the response after the Action is applied.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/actions/deep-research-create-deep-research-session-with-id-action/apply
// Edit this import if your client location differs
import { client } from "./client";
import { deepResearchCreateDeepResearchSessionWithIdAction  } from "@gmahler-deep-research-service-user/sdk";

async function callAction() {
    const result = await client(deepResearchCreateDeepResearchSessionWithIdAction).applyAction(
        {
            "id": "value",
            "currentUser": "value",
            "query": "value",
            "report": "value",
            "title": "value",
        },
        {
            $returnEdits: true,
        }
    );
    if (result.type === "edits") {
        // use the result object to report back on action results
        const updatedObject = result.editedObjectTypes[0];
        console.log("Updated object", updatedObject);
    }
}
Batch apply deep-research-create-deep-research-session-with-id-action
You can apply the same Action multiple times in one batch operation instead of making individual calls. This requires sending the input parameters for each Action call as an array. If one Action call fails, the entire batch call fails.

Parameters
parameters
object
Map of parameter ID to values to use for those input parameters.
Show child parameters
id
string
No description provided.
currentUser
string
No description provided.
query
string
No description provided.
report
string
No description provided.
title
string
No description provided.
options
BatchApplyActionRequestOptions
(optional)
Additional options to pass to the request.
Show child parameters
returnEdits
"ALL" | "NONE"
= "NONE"
Whether the edits are returned in the response after the Action is applied.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/actions/deep-research-create-deep-research-session-with-id-action/applyBatch
// Edit this import if your client location differs
import { client } from "./client";
import { deepResearchCreateDeepResearchSessionWithIdAction  } from "@gmahler-deep-research-service-user/sdk";

async function callBatchAction() {
    const result = await client(deepResearchCreateDeepResearchSessionWithIdAction).batchApplyAction([
            {
                "id": "value",
                "currentUser": "value",
                "query": "value",
                "report": "value",
                "title": "value",
            },
            {
                "id": "value",
                "currentUser": "value",
                "query": "value",
                "report": "value",
                "title": "value",
            },
        ],
        {
            $returnEdits: true,
        }
    );
    if (result.type === "edits") {
        // use the result object to report back on action results
        const updatedObject = result.editedObjectTypes[0];
        console.log("Updated object", updatedObject);
    }
}