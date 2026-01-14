Create Session Event

Description
No description
Parameters
Name
Parameter ID
Type	Description
Session ID	sessionId	
String
No description
Created At	createdAt	
Timestamp
No description
Status	status	
String
No description
Error	error	
Boolean
No description
Message	message	
String
No description
Apply create-session-event
To apply this Action, fill in the input parameter values.

Parameters
parameters
object
Map of parameter ID to values to use for those input parameters.
Show child parameters
sessionId
string
No description provided.
createdAt
string
ISO 8601 extended offset date-time string in UTC zone.
status
string
No description provided.
error
boolean
No description provided.
message
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
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/actions/create-session-event/apply
// Edit this import if your client location differs
import { client } from "./client";
import { createSessionEvent  } from "@gmahler-deep-research-service-user/sdk";

async function callAction() {
    const result = await client(createSessionEvent).applyAction(
        {
            "sessionId": "value",
            "createdAt": "2026-01-12T15:22:32.048Z",
            "status": "value",
            "error": true,
            "message": "value",
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
Batch apply create-session-event
You can apply the same Action multiple times in one batch operation instead of making individual calls. This requires sending the input parameters for each Action call as an array. If one Action call fails, the entire batch call fails.

Parameters
parameters
object
Map of parameter ID to values to use for those input parameters.
Show child parameters
sessionId
string
No description provided.
createdAt
string
ISO 8601 extended offset date-time string in UTC zone.
status
string
No description provided.
error
boolean
No description provided.
message
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
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/actions/create-session-event/applyBatch
// Edit this import if your client location differs
import { client } from "./client";
import { createSessionEvent  } from "@gmahler-deep-research-service-user/sdk";

async function callBatchAction() {
    const result = await client(createSessionEvent).batchApplyAction([
            {
                "sessionId": "value",
                "createdAt": "2026-01-12T15:22:32.053Z",
                "status": "value",
                "error": true,
                "message": "value",
            },
            {
                "sessionId": "value",
                "createdAt": "2026-01-12T15:22:32.053Z",
                "status": "value",
                "error": true,
                "message": "value",
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