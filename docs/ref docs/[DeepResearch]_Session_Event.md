[DeepResearch] Session Event

Description
No description

Properties
Property
API Name
Type	Description
Primary Key
primaryKey_	
String
No description
Created At
createdAt	
Timestamp
No description
Error
error	
Boolean
No description
Message
message	
String
No description
Session ID
sessionId	
String
No description
Status
status	
String
No description
Load single [DeepResearch] Session Event
Parameters
primaryKey
string
The primary key of the [DeepResearch] Session Event you want to fetch
GET
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/SessionEvent/{primaryKey}
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";
import type { Osdk } from "@osdk/client";

const responseNoErrorWrapper: Osdk.Instance<SessionEvent> = await client(SessionEvent).fetchOne("Primary Key");
Load pages of Session Events
Load a list of objects of a requested page size, after a given page token if present.

Note that this endpoint leverages the underlying object syncing technology used for the object type. If [DeepResearch] Session Event is backed by Object Storage V2, there is no request limit. If it is backed by Phonograph, there is a limit of 10,000 results – when more than 10,000 Session Events have been requested, a ObjectsExceededLimit error will be thrown.

Parameters
pageSize
integer
(optional)
The size of the page to request up to a maximum of 10,000. If not provided, will load up to 10,000 Session Events. The pageSize of the initial page is used for subsequent pages.
pageToken
string
(optional)
If provided, will request a page with size less than or equal to the pageSize of the first requested page.
GET
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/SessionEvent
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";
import type { Osdk, PageResult } from "@osdk/client";
try {
    const responseNoErrorWrapper: PageResult<Osdk.Instance<SessionEvent>>
        = await client(SessionEvent).fetchPage({ $pageSize: 30 });
} catch (e) {
    throw e;
}
Load all Session Events
Loads all Session Events. Depending on the language, results could be a list with all rows or an iterator to loop through all rows.

Note that this endpoint leverages the underlying object syncing technology used for the object type. If [DeepResearch] Session Event is backed by Object Storage V2, there is no request limit. If it is backed by Phonograph, there is a limit of 10,000 results – when more than 10,000 Session Events have been requested, a ObjectsExceededLimit error will be thrown.

POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objectSets/loadObjects
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";
import type { Osdk } from "@osdk/client";

async function getAll(): Promise<Array<Osdk.Instance<SessionEvent>>> {
    const objects: Osdk.Instance<SessionEvent>[]= [];
    for await(const obj of client(SessionEvent).asyncIter()) {
        objects.push(obj);
    }

    return objects;
}

// If Array.fromAsync() is available in your target environment
function getAllFromAsync(): Promise<Array<Osdk.Instance<SessionEvent>>> {
    return Array.fromAsync(client(SessionEvent).asyncIter());
}
Load ordered results
Load an ordered list of Session Events by specifying a sort direction for specific properties. When calling via APIs, sorting criteria are specified via the fields array. When calling via SDKs, you can chain multiple orderBy calls together. The sort order for strings is case-sensitive, meaning numbers will come before uppercase letters, which will come before lowercase letters. For example, "Cat" will come before "bat".

Parameters
field
string
The property you want to sort by. With the SDK, this is provided for you via a sortBy interface.
direction
asc
|
desc
The direction you want to sort in, either ascending or descending. With the SDK, this is provided via the asc() and desc() functions on the sortBy interface.
GET
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/SessionEvent
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";
import { type Osdk, type PageResult } from "@osdk/client";

try {
    const page: PageResult<Osdk.Instance<SessionEvent>> = await client(SessionEvent)
        .fetchPage({
            $orderBy: {"primaryKey_": "asc"},
            $pageSize: 30
        });
    const objects = page.data;
    const object = objects[0];
} catch (e) {
    throw e;
}
Load linked [T11] Session
Select link type

[T11] Session
Load linked [T11] Session from an instance of [DeepResearch] Session Event

Parameters
primaryKey
string
Primary key of [DeepResearch] Session Event to start from. If loading via the SDK, this is assumed via a previous .get() call.
pageSize
integer
(optional)
The size of the page to request up to a maximum of 10,000. If not provided, will load up to 10,000 Sessions. The pageSize of the initial page is used for subsequent pages. Since this is a one sided link, the SDK will automatically fetch a single [T11] Session.
pageToken
string
(optional)
If provided, will request a page with size less than or equal to the pageSize of the first requested page. If more than 10,000 Sessions have been requested, an ObjectsExceededLimit error will be thrown. Since this is a one sided link, the SDK will automatically fetch a single [T11] Session.
GET
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/SessionEvent/{primaryKey}/links/session
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

async function getLinkedWithPivotSession(){
    return await client(SessionEvent).pivotTo("session").fetchPage();
}
Filtering
The types of filtering you can perform depend on the types of the properties on a given object type. These filters can also be combined together via Boolean expressions to construct more complex filters.

Note that this endpoint leverages the underlying object syncing technology used for the object type. If [DeepResearch] Session Event is backed by Object Storage V2, there is no request limit. If it is backed by Phonograph, there is a limit of 10,000 results – when more than 10,000 Session Events have been requested, a ObjectsExceededLimit error will be thrown.

Parameters
where
SearchQuery
(optional)
Filter on a particular property. The possible operations depend on the type of the property.
orderBy
OrderByQuery
(optional)
Order the results based on a particular property. If using the SDK, you can chain the .where call with an orderBy call to achieve the same result.
pageSize
integer
(optional)
The size of the page to request up to a maximum of 10,000. If not provided, will load up to 10,000 Session Events. The pageSize of the initial page is used for subsequent pages. If using the SDK, chain the .where call with the .page method.
pageToken
string
(optional)
If provided, will request a page with size less than or equal to the pageSize of the first requested page. If using the SDK, chain the .where call with the .page method.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/SessionEvent/search
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";
import { type Osdk, type PageResult } from "@osdk/client";

try {
    const page: PageResult<Osdk.Instance<SessionEvent>> = await client(SessionEvent)
        .where({
            primaryKey_: {$isNull: true}
        })
        .fetchPage({
            $pageSize: 30
        });
    const objects = page.data;
    const object = objects[0];
} catch (e) {
    throw e;
}
Types of search filters (SearchQuery)

Jump to

Hide
Starts with
Select property type

Message
Only applies to
string properties.
Searches for Session Events where message starts with the given string (case insensitive).

Parameters
field
string
Name of the property to use (for example, message).
value
string
Value to use for prefix matching against Message. For example, "foo" will match "foobar" but not "barfoo".
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/SessionEvent/search
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionEventObjectSet = client(SessionEvent)
    .where({
        message: { $startsWith: "foo" }
    })
Contains any terms
Select property type

Message
Only applies to
string properties.
Returns Session Events where message contains any of the white space separated words (case insensitive) in any order in the provided value.

Parameters
field
string
Name of the property to use (for example, message).
value
string
White space separated set of words to match on. For example, "foo bar" will match "bar baz" but not "baz qux".
fuzzy
boolean
Allows approximate matching in search queries.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/SessionEvent/search
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionEventObjectSet = client(SessionEvent)
    .where({
        message: { $containsAnyTerm: "foo bar" }
    })
Contains all terms
Select property type

Message
Only applies to
string properties.
Returns Session Events where message contains all of the white space separated words (case insensitive) in any order in the provided value.

Parameters
field
string
Name of the property to use (for example, message).
value
string
White space separated set of words to match on. For example, "foo bar" will match "hello foo baz bar" but not "foo qux".
fuzzy
boolean
Allows approximate matching in search queries.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/SessionEvent/search
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionEventObjectSet = client(SessionEvent)
    .where({
        message: { $containsAllTerms: "foo bar" }
    })
Contains all terms in order
Select property type

Message
Only applies to
string properties.
Returns Session Events where message contains all of the terms in the order provided (case insensitive), but they must be adjacent to each other.

Parameters
field
string
Name of the property to use (for example, message).
value
string
White space separated set of words to match on. For example, "foo bar" will match "hello foo bar baz" but not "bar foo qux".
fuzzy
boolean
Allows approximate matching in search queries.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/SessionEvent/search
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionEventObjectSet = client(SessionEvent)
    .where({
        message: { $containsAllTermsInOrder: "foo bar" }
    })
Range comparison
Select comparison type

Less than
Select property type

Created At
Only applies to
numeric,
string, and
datetime properties.
Returns Session Events where SessionEvent.createdAt is less than a value.

Parameters
field
string
Name of the property to use (for example, createdAt).
value
Timestamp
Value to compare Created At against.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/SessionEvent/search
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionEventObjectSet = client(SessionEvent)
    .where({
        createdAt: { $lt: "2026-01-12T15:18:18.254Z" }
    });
Equal to
Select property type

Created At
Only applies to
Boolean,
datetime,
numeric, and
string properties.
Searches for Session Events where createdAt equals the given value.

Parameters
field
string
Name of the property to use (for example, createdAt).
value
Timestamp
Value to do an equality check with Created At.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/SessionEvent/search
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionEventObjectSet = client(SessionEvent)
    .where({
        createdAt: { $eq: "2026-01-12T15:18:18.255Z" }
    });
In array
Select property type

Created At
Only applies to
Boolean,
datetime,
numeric, and
string properties.
Searches for Session Events where createdAt equals one of the given values in the array.

Parameters
field
string
Name of the property to use (for example, createdAt).
value
Timestamp[]
Array of values to do an equality check with Created At. If the provided array is empty, the filter will match all objects.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/SessionEvent/search
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionEventObjectSet = client(SessionEvent)
    .where({
        createdAt: { $in: ["2026-01-12T15:18:18.255Z"] }
    });
Null check
Select property type

Created At
Only applies to
array,
Boolean,
datetime,
numeric, and
string properties.
Searches for Session Events based on whether a value for createdAt exists or not.

Parameters
field
string
Name of the property to use (for example, createdAt).
value
boolean
Whether or not Created At exists. For the TypeScript SDK, you will need to use a not filter for checking that fields are non-null.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/SessionEvent/search
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionEventObjectSet = client(SessionEvent)
    .where({
        createdAt: { $isNull: true }
    });
Not filter
Returns Session Events where the query is not satisfied. This can be further combined with other boolean filter operations.

Parameters
value
SearchQuery
The search query to invert.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/SessionEvent/search
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionEventObjectSet = client(SessionEvent)
    .where({ $not: { createdAt: { $eq: "2026-01-12T15:18:18.257Z" }}});
And filter
Returns Session Events where all queries are satisfied. This can be further combined with other Boolean filter operations.

Parameters
value
SearchQuery[]
The set of search queries to and together.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/SessionEvent/search
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionEventObjectSet = client(SessionEvent)
    .where({ $and:[
        { $not: { primaryKey_: { $isNull: true }}},
        { createdAt: { $eq: "2026-01-12T15:18:18.257Z" }}
    ]});
Or filter
Returns Session Events where any queries are satisfied. This can be further combined with other Boolean filter operations.

Parameters
value
SearchQuery[]
The set of search queries to or together.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/SessionEvent/search
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionEventObjectSet = client(SessionEvent)
    .where({ $or:[
        { $not: { primaryKey_: { $isNull: true }}},
        { createdAt: { $eq: "2026-01-12T15:18:18.258Z" }}
    ]});
Aggregations
Perform aggregations on Session Events

Parameters
aggregation
Aggregation[]
(optional)
Set of aggregation functions to perform. With the SDK, aggregation computations can be chained together with further searches using .where
groupBy
GroupBy[]
(optional)
A set of groupings to create for aggregation results
where
SearchQuery
(optional)
Filter on a particular property. The possible operations depend on the type of the property.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/SessionEvent/aggregate
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const numSessionEvent = await client(SessionEvent)
    .where({ primaryKey_: { $isNull : false }})
    .aggregate({
        $select: { $count: "unordered" },
        //$groupBy: { primaryKey_: "exact" },
    });
Types of aggregations (Aggregation)

Show
Types of group bys (GroupBy)

Show
Object set operations
Foundry object sets represent unordered collections of objects of a single type. These sets can be manipulated and combined by chaining object set operations to return a new object set of the same type.

Note that Filtering can also be used to manipulate object sets.

POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objectSets/loadObjects
// Edit this import if your client location differs
import { client } from "./client";
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";

const objectSetA = client(SessionEvent).where({ primaryKey_: { $containsAnyTerm: "a"}})
const objectSetB = client(SessionEvent).where({ primaryKey_: { $containsAnyTerm: "b"}})
const objectSetC = client(SessionEvent).where({ primaryKey_: { $containsAnyTerm: "c"}})

// Object set operations can be chained. e.g. To find all objects in objectSetA 
// that are present in objectSetB but do not exist in objectSetC:
const result = objectSetA
  .intersect(objectSetB)
  .subtract(objectSetC)
Types of operations

Show
Load [DeepResearch] Session Event metadata
Load up-to-date metadata for the [DeepResearch] Session Event object type, such as the display name, icon, visibility, and status.

Note that this will return the latest information regardless of the version of your generated SDK. This means you may receive new properties, interfaces, or other metadata that your SDK itself is not yet aware of. If you wish to include these in your SDK, regenerate your SDK.

GET
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objectTypes/SessionEvent/fullMetadata
import { SessionEvent } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const objectTypeMetadata = await client.fetchMetadata(SessionEvent);

if (objectTypeMetadata?.icon?.type === "blueprint") {
    const blueprintIconName = objectTypeMetadata.icon.name;
}
const currentVisibility = objectTypeMetadata.visibility;
const currentDescription = objectTypeMetadata.description;
Subscribe to object sets
Subscribing to an object set allows you to receive real-time updates when objects are added or removed, or when properties of objects are modified. Object sets can be filtered down to specify the objects that should trigger updates.

Ensure you are using a 2.1.x version of the @osdk/client package or higher in your Project to enable this feature.

Parameters
listener
ObjectSetListener
An object containing handlers that will be called during the subscription lifecycle.
Show child parameters
opts
ObjectSetListenerOptions
(optional)
An object containing options for the subscription.
Show child parameters
WebSocket
// Upgrade to 2.1 for official support
Associated Action types
The following Action types are associated with this object type. These include any Actions that use this object type as an input parameter and Actions that create, modify or delete objects of this type. See the linked documentation for each Action type for more details on their behavior and how they can be used.

Create Session Event

