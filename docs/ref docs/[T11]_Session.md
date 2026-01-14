[T11] Session

Description
No description

Properties
Property
API Name
Type	Description
Session Id
sessionId	
String
No description
Title
title	
String
No description
Query
query	
String
No description
Report
report	
String
No description
Time
time	
Timestamp
No description
User Id
userId	
String
No description
Load single [T11] Session
Parameters
primaryKey
string
The primary key of the [T11] Session you want to fetch
GET
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/{primaryKey}
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";
import type { Osdk } from "@osdk/client";

const responseNoErrorWrapper: Osdk.Instance<Session> = await client(Session).fetchOne("Session Id");
Load pages of Sessions
Load a list of objects of a requested page size, after a given page token if present.

Note that this endpoint leverages the underlying object syncing technology used for the object type. If [T11] Session is backed by Object Storage V2, there is no request limit. If it is backed by Phonograph, there is a limit of 10,000 results – when more than 10,000 Sessions have been requested, a ObjectsExceededLimit error will be thrown.

Parameters
pageSize
integer
(optional)
The size of the page to request up to a maximum of 10,000. If not provided, will load up to 10,000 Sessions. The pageSize of the initial page is used for subsequent pages.
pageToken
string
(optional)
If provided, will request a page with size less than or equal to the pageSize of the first requested page.
GET
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";
import type { Osdk, PageResult } from "@osdk/client";
try {
    const responseNoErrorWrapper: PageResult<Osdk.Instance<Session>>
        = await client(Session).fetchPage({ $pageSize: 30 });
} catch (e) {
    throw e;
}
Load all Sessions
Loads all Sessions. Depending on the language, results could be a list with all rows or an iterator to loop through all rows.

Note that this endpoint leverages the underlying object syncing technology used for the object type. If [T11] Session is backed by Object Storage V2, there is no request limit. If it is backed by Phonograph, there is a limit of 10,000 results – when more than 10,000 Sessions have been requested, a ObjectsExceededLimit error will be thrown.

POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objectSets/loadObjects
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";
import type { Osdk } from "@osdk/client";

async function getAll(): Promise<Array<Osdk.Instance<Session>>> {
    const objects: Osdk.Instance<Session>[]= [];
    for await(const obj of client(Session).asyncIter()) {
        objects.push(obj);
    }

    return objects;
}

// If Array.fromAsync() is available in your target environment
function getAllFromAsync(): Promise<Array<Osdk.Instance<Session>>> {
    return Array.fromAsync(client(Session).asyncIter());
}
Load ordered results
Load an ordered list of Sessions by specifying a sort direction for specific properties. When calling via APIs, sorting criteria are specified via the fields array. When calling via SDKs, you can chain multiple orderBy calls together. The sort order for strings is case-sensitive, meaning numbers will come before uppercase letters, which will come before lowercase letters. For example, "Cat" will come before "bat".

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
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";
import { type Osdk, type PageResult } from "@osdk/client";

try {
    const page: PageResult<Osdk.Instance<Session>> = await client(Session)
        .fetchPage({
            $orderBy: {"title": "asc"},
            $pageSize: 30
        });
    const objects = page.data;
    const object = objects[0];
} catch (e) {
    throw e;
}
Load link by primary key
Select link type

[DeepResearch] Session Event
Go from an instance of [T11] Session to a single instance of [DeepResearch] Session Event via a primary key of [DeepResearch] Session Event.

Parameters
primaryKey
string
Primary key of [T11] Session to start from. If loading via the SDK, this is assumed via a previous .get() call.
linkedObjectPrimaryKey
string
Primary key of [DeepResearch] Session Event to fetch.
GET
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/{primaryKey}/links/sessionEvents/{linkedObjectPrimaryKey}
import { type  } from "@gmahler-deep-research-service-user/sdk";
import { type Osdk } from "@osdk/client";

async function getLinkedSessionEvent(source: Osdk.Instance<>) {
    try {
        return await source.$link.sessionEvents.fetchPage();
    } catch (error) {
        return { error };
    }
}
Load linked Session Events
Select link type

[DeepResearch] Session Event
Load linked Session Events from an instance of [T11] Session

Parameters
primaryKey
string
Primary key of [T11] Session to start from. If loading via the SDK, this is assumed via a previous .get() call.
pageSize
integer
(optional)
The size of the page to request up to a maximum of 10,000. If not provided, will load up to 10,000 Session Events. The pageSize of the initial page is used for subsequent pages.
pageToken
string
(optional)
If provided, will request a page with size less than or equal to the pageSize of the first requested page. If more than 10,000 Session Events have been requested, an ObjectsExceededLimit error will be thrown.
GET
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/{primaryKey}/links/sessionEvents
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

async function getLinkedWithPivotSessionEvent(){
    return await client(Session).pivotTo("sessionEvents").fetchPage();
}
Filtering
The types of filtering you can perform depend on the types of the properties on a given object type. These filters can also be combined together via Boolean expressions to construct more complex filters.

Note that this endpoint leverages the underlying object syncing technology used for the object type. If [T11] Session is backed by Object Storage V2, there is no request limit. If it is backed by Phonograph, there is a limit of 10,000 results – when more than 10,000 Sessions have been requested, a ObjectsExceededLimit error will be thrown.

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
The size of the page to request up to a maximum of 10,000. If not provided, will load up to 10,000 Sessions. The pageSize of the initial page is used for subsequent pages. If using the SDK, chain the .where call with the .page method.
pageToken
string
(optional)
If provided, will request a page with size less than or equal to the pageSize of the first requested page. If using the SDK, chain the .where call with the .page method.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/search
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";
import { type Osdk, type PageResult } from "@osdk/client";

try {
    const page: PageResult<Osdk.Instance<Session>> = await client(Session)
        .where({
            title: {$isNull: true}
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

Query
Only applies to
string properties.
Searches for Sessions where query starts with the given string (case insensitive).

Parameters
field
string
Name of the property to use (for example, query).
value
string
Value to use for prefix matching against Query. For example, "foo" will match "foobar" but not "barfoo".
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/search
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionObjectSet = client(Session)
    .where({
        query: { $startsWith: "foo" }
    })
Contains any terms
Select property type

Query
Only applies to
string properties.
Returns Sessions where query contains any of the white space separated words (case insensitive) in any order in the provided value.

Parameters
field
string
Name of the property to use (for example, query).
value
string
White space separated set of words to match on. For example, "foo bar" will match "bar baz" but not "baz qux".
fuzzy
boolean
Allows approximate matching in search queries.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/search
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionObjectSet = client(Session)
    .where({
        query: { $containsAnyTerm: "foo bar" }
    })
Contains all terms
Select property type

Query
Only applies to
string properties.
Returns Sessions where query contains all of the white space separated words (case insensitive) in any order in the provided value.

Parameters
field
string
Name of the property to use (for example, query).
value
string
White space separated set of words to match on. For example, "foo bar" will match "hello foo baz bar" but not "foo qux".
fuzzy
boolean
Allows approximate matching in search queries.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/search
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionObjectSet = client(Session)
    .where({
        query: { $containsAllTerms: "foo bar" }
    })
Contains all terms in order
Select property type

Query
Only applies to
string properties.
Returns Sessions where query contains all of the terms in the order provided (case insensitive), but they must be adjacent to each other.

Parameters
field
string
Name of the property to use (for example, query).
value
string
White space separated set of words to match on. For example, "foo bar" will match "hello foo bar baz" but not "bar foo qux".
fuzzy
boolean
Allows approximate matching in search queries.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/search
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionObjectSet = client(Session)
    .where({
        query: { $containsAllTermsInOrder: "foo bar" }
    })
Range comparison
Select comparison type

Less than
Select property type

Query
Only applies to
numeric,
string, and
datetime properties.
Returns Sessions where Session.query is less than a value.

Parameters
field
string
Name of the property to use (for example, query).
value
string
Value to compare Query against.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/search
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionObjectSet = client(Session)
    .where({
        query: { $lt: "Query" }
    });
Equal to
Select property type

Query
Only applies to
Boolean,
datetime,
numeric, and
string properties.
Searches for Sessions where query equals the given value.

Parameters
field
string
Name of the property to use (for example, query).
value
string
Value to do an equality check with Query.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/search
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionObjectSet = client(Session)
    .where({
        query: { $eq: "Query" }
    });
In array
Select property type

Query
Only applies to
Boolean,
datetime,
numeric, and
string properties.
Searches for Sessions where query equals one of the given values in the array.

Parameters
field
string
Name of the property to use (for example, query).
value
string[]
Array of values to do an equality check with Query. If the provided array is empty, the filter will match all objects.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/search
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionObjectSet = client(Session)
    .where({
        query: { $in: ["Query"] }
    });
Null check
Select property type

Query
Only applies to
array,
Boolean,
datetime,
numeric, and
string properties.
Searches for Sessions based on whether a value for query exists or not.

Parameters
field
string
Name of the property to use (for example, query).
value
boolean
Whether or not Query exists. For the TypeScript SDK, you will need to use a not filter for checking that fields are non-null.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/search
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionObjectSet = client(Session)
    .where({
        query: { $isNull: true }
    });
Not filter
Returns Sessions where the query is not satisfied. This can be further combined with other boolean filter operations.

Parameters
value
SearchQuery
The search query to invert.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/search
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionObjectSet = client(Session)
    .where({ $not: { query: { $eq: "Query" }}});
And filter
Returns Sessions where all queries are satisfied. This can be further combined with other Boolean filter operations.

Parameters
value
SearchQuery[]
The set of search queries to and together.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/search
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionObjectSet = client(Session)
    .where({ $and:[
        { $not: { sessionId: { $isNull: true }}},
        { query: { $eq: "Query" }}
    ]});
Or filter
Returns Sessions where any queries are satisfied. This can be further combined with other Boolean filter operations.

Parameters
value
SearchQuery[]
The set of search queries to or together.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/search
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const SessionObjectSet = client(Session)
    .where({ $or:[
        { $not: { sessionId: { $isNull: true }}},
        { query: { $eq: "Query" }}
    ]});
Aggregations
Perform aggregations on Sessions

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
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/aggregate
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const numSession = await client(Session)
    .where({ title: { $isNull : false }})
    .aggregate({
        $select: { $count: "unordered" },
        //$groupBy: { title: "exact" },
    });
Types of aggregations (Aggregation)

Jump to

Hide
Approximate distinct
Select property type

Query
Computes an approximate number of distinct values for query

Parameters
field
string
Name of the property to use (for example, query).
name
string
(optional)
Alias for the computed count. By default, this is "distinctCount"
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/aggregate
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const distinctSession = await client(Session)
    .aggregate({
        $select: { "query:approximateDistinct" : "unordered" },
    });
Exact distinct
Select property type

Query
Computes an exact number of distinct values for query

Parameters
field
string
Name of the property to use (for example, query).
name
string
(optional)
Alias for the computed count. By default, this is "exactDistinctCount"
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/aggregate
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const distinctSession = await client(Session)
    .aggregate({
        $select: { "query:exactDistinct" : "unordered" },
    });
Count
Computes the total count of Sessions

Parameters
name
string
(optional)
Alias for the computed count. By default, this is "count"
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/aggregate
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const numSession = await client(Session)
    .aggregate({
        $select: {$count: "unordered"},
    });
Types of group bys (GroupBy)

Jump to

Hide
Exact grouping
Select property type

Query
Groups Sessions by exact values of query.

Parameters
field
string
Name of the property to use (for example, query).
maxGroupCount
integer
(optional)
Maximum number of groupings of query to create.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/aggregate
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const groupedSession = await client(Session)
    .aggregate({
        $select: { $count: "unordered" },
        $groupBy: { query: "exact" }
    })
Range grouping
Select property type

Time
Only applies to
numeric,
date, and
timestamp properties
Groups Sessions by specified ranges of time.

Parameters
field
string
Name of the property to use (for example, time).
ranges
Range[]
(optional)
Set of ranges which have an inclusive start value and exclusive end value.
Show child parameters
startValue
timestamp
Start of the range (inclusive)
endValue
timestamp
End value (exclusive)
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/aggregate
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const groupedSession = await client(Session)
    .aggregate({
        $select: { $count: "unordered" },
        $groupBy: { time: { $ranges: [["2026-01-12T15:19:14.074Z", "2026-01-13T15:19:14.074Z" ]]} }
    });
Datetime bucketing
Select example duration

Days
Select property type

Time
Only applies to
date, and
timestamp properties
Groups Sessions by time via buckets of a specific date/time duration.

Parameters
field
string
Name of the property to use (for example, time).
value
double
The number of duration units to group by. Must be set to 1 if grouping by WEEKS, MONTHS, QUARTERS, or YEARS.
If using the SDK, this is provided via convenience methods instead.
unit
string
One of the following units: SECONDS, MINUTES, HOURS, DAYS, WEEKS, MONTHS, QUARTERS or YEARS.
If using the SDK, this is provided via convenience methods instead.
POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objects/Session/aggregate
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const groupedSession = await client(Session)
    .aggregate({
        $select: { $count: "unordered" },
        $groupBy: { time: { $duration: [ 10, "DAYS"] } }
    });
Object set operations
Foundry object sets represent unordered collections of objects of a single type. These sets can be manipulated and combined by chaining object set operations to return a new object set of the same type.

Note that Filtering can also be used to manipulate object sets.

POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objectSets/loadObjects
// Edit this import if your client location differs
import { client } from "./client";
import { Session } from "@gmahler-deep-research-service-user/sdk";

const objectSetA = client(Session).where({ title: { $containsAnyTerm: "a"}})
const objectSetB = client(Session).where({ title: { $containsAnyTerm: "b"}})
const objectSetC = client(Session).where({ title: { $containsAnyTerm: "c"}})

// Object set operations can be chained. e.g. To find all objects in objectSetA 
// that are present in objectSetB but do not exist in objectSetC:
const result = objectSetA
  .intersect(objectSetB)
  .subtract(objectSetC)
Types of operations

Jump to

Hide
Union
The union operation creates a new object set composed of objects present in any of the given object sets.

POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objectSets/loadObjects
// Edit this import if your client location differs
import { client } from "./client";
import { Session } from "@gmahler-deep-research-service-user/sdk";

const objectSetA = client(Session).where({ title: { $containsAnyTerm: "a"}})
const objectSetB = client(Session).where({ title: { $containsAnyTerm: "b"}})
const objectSetC = client(Session).where({ title: { $containsAnyTerm: "c"}})

// Combine objectSetA, objectSetB and objectSetC
const result = objectSetA
  .union(objectSetB)
  .union(objectSetC) // alternatively: objectSetA.union(objectSetB, objectSetC)
Subtract
The subtract operation removes any objects present in the object set being operated on from the given object sets.

POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objectSets/loadObjects
// Edit this import if your client location differs
import { client } from "./client";
import { Session } from "@gmahler-deep-research-service-user/sdk";

const objectSetA = client(Session).where({ title: { $containsAnyTerm: "a"}})
const objectSetB = client(Session).where({ title: { $containsAnyTerm: "b"}})
const objectSetC = client(Session).where({ title: { $containsAnyTerm: "c"}})


// Return objects in objectSetA that are not present in either objectSetB or objectSetC
const result = objectSetA
  .subtract(objectSetB)
  .subtract(objectSetC) // alternatively: objectSetA.subtract(objectSetB, objectSetC)
Intersect
The intersect operation creates a new object set composed of objects present in all of the given object sets.

POST
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objectSets/loadObjects
// Edit this import if your client location differs
import { client } from "./client";
import { Session } from "@gmahler-deep-research-service-user/sdk";

const objectSetA = client(Session).where({ title: { $containsAnyTerm: "a"}})
const objectSetB = client(Session).where({ title: { $containsAnyTerm: "b"}})
const objectSetC = client(Session).where({ title: { $containsAnyTerm: "c"}})


// Return all objects common to objectSetA, objectSetB and objectSetC
const result = objectSetA
  .intersect(objectSetB)
  .intersect(objectSetC) // alternatively: objectSetA.intersect(objectSetB, objectSetC)
Load [T11] Session metadata
Load up-to-date metadata for the [T11] Session object type, such as the display name, icon, visibility, and status.

Note that this will return the latest information regardless of the version of your generated SDK. This means you may receive new properties, interfaces, or other metadata that your SDK itself is not yet aware of. If you wish to include these in your SDK, regenerate your SDK.

GET
/v2/ontologies/ontology-1f6059b8-ed49-499f-99f3-da8eec3cc17f/objectTypes/Session/fullMetadata
import { Session } from "@gmahler-deep-research-service-user/sdk";
// Edit this import if your client location differs
import { client } from "./client";

const objectTypeMetadata = await client.fetchMetadata(Session);

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
onChange
(ObjectSetUpdate) => void
A function that will be called when an object in the object set is created, updated, or deleted.
Show child parameters
object
Session.OsdkInstance
The object that was created, updated, or deleted. The object is not guaranteed to contain all requested properties.
state
"ADDED_OR_UPDATED" | "DELETED"
ADDED_OR_UPDATED indicates the returned object was added or one of its properties was updated. DELETED indicates the object was deleted.
onSuccessfulSubscription
() => void
A function that will be called when the subscription is successfully established.
onError
(error: any) => void
A function that will be called when an error occurs during subscription, at which point the subscription is closed and no more updates will be received.
onOutOfDate
() => void
A function that will be called when some changes to the object set have not been included in the subscription, indicating that all objects in the object set should be reloaded to get the latest data.
opts
ObjectSetListenerOptions
(optional)
An object containing options for the subscription.
Show child parameters
properties
string[]
(optional)
An array of property names that should be included in the objects returned by the subscription. If not provided, all properties will be included. It is still possible to receive objects that do not contain all requested properties.
WebSocket
// Upgrade to 2.1 for official support
Associated Action types
The following Action types are associated with this object type. These include any Actions that use this object type as an input parameter and Actions that create, modify or delete objects of this type. See the linked documentation for each Action type for more details on their behavior and how they can be used.

Create Session