/**
 * Foundry API Client
 * Provides functions to interact with Palantir Foundry APIs
 */

import { getAuthToken, isAuthConfigured } from './foundry-auth';
import { $ontologyRid } from '@gmahler-deep-research-service-user/sdk';

const FOUNDRY_BASE_URL = process.env.FOUNDRY_BASE_URL;

if (!isAuthConfigured() || !FOUNDRY_BASE_URL) {
  console.warn('Warning: Authentication or FOUNDRY_BASE_URL not configured. Foundry API calls will fail.');
}

// Cache for object types we don't have permission to access (persists for session)
const deniedObjectTypes = new Set<string>();

// Cache for object type schemas (to avoid repeated API calls)
const schemaCache = new Map<string, { schema: FoundryObjectSchema; timestamp: number }>();
const SCHEMA_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
  const token = await getAuthToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
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
  const configuredOntologyRid = process.env.FOUNDRY_ONTOLOGY_RID ?? process.env.ONTOLOGY_RID ?? $ontologyRid;

  if (configuredOntologyRid) {
    return configuredOntologyRid;
  }

  return null;
}

/**
 * Score how relevant an object type name is to a search query
 * Returns a score from 0-100
 */
function scoreTypeRelevance(typeName: string, searchQuery: string): number {
  const typeNameLower = typeName.toLowerCase();
  const queryLower = searchQuery.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);

  let score = 0;

  // Exact match of type name in query
  if (queryLower.includes(typeNameLower)) {
    score += 50;
  }

  // Type name contains query terms
  for (const term of queryTerms) {
    if (typeNameLower.includes(term)) {
      score += 20;
    }
  }

  // Common relevant type patterns for different query types
  const relevancePatterns: Record<string, string[]> = {
    // People-related queries
    'resume|candidate|hire|hiring|recruit|employee|person|people|staff|team':
      ['person', 'people', 'employee', 'candidate', 'resume', 'resource', 'user', 'staff', 'team', 'member'],
    // Project-related queries
    'project|initiative|program|work|task':
      ['project', 'task', 'initiative', 'program', 'work', 'ticket'],
    // Document-related queries
    'document|file|upload|attachment|report':
      ['document', 'file', 'upload', 'attachment', 'report', 'note'],
    // Customer-related queries
    'customer|client|account|company|organization':
      ['customer', 'client', 'account', 'company', 'organization', 'org'],
  };

  for (const [queryPattern, typePatterns] of Object.entries(relevancePatterns)) {
    const queryRegex = new RegExp(queryPattern, 'i');
    if (queryRegex.test(queryLower)) {
      for (const pattern of typePatterns) {
        if (typeNameLower.includes(pattern)) {
          score += 30;
          break;
        }
      }
    }
  }

  // Penalize internal/system types
  const systemPatterns = ['posthog', 'analytics', 'log', 'audit', 'system', 'config', 'setting'];
  for (const pattern of systemPatterns) {
    if (typeNameLower.includes(pattern)) {
      score -= 20;
    }
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Rank object types by relevance to a search query
 */
function rankObjectTypesByRelevance(objectTypes: string[], searchQuery: string): string[] {
  const scored = objectTypes.map(type => ({
    type,
    score: scoreTypeRelevance(type, searchQuery)
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.map(s => s.type);
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
    objectTypes?: string[]; // Array of object type API names to search (takes precedence over autoDiscover)
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
    objectTypes,
    maxResults = 10,
    autoDiscover = false,
  } = options;

  try {
    // If an array of object types is provided, search those specific types in parallel
    if (objectTypes && objectTypes.length > 0) {
      console.log(`Searching ${objectTypes.length} specified object types: ${objectTypes.join(', ')}`);

      // Filter out types we've already been denied access to
      const accessibleTypes = objectTypes.filter(type => !deniedObjectTypes.has(type));

      if (accessibleTypes.length === 0) {
        console.warn('All specified object types have been denied access');
        return { data: [], totalCount: 0, searchedTypes: objectTypes };
      }

      // Search specified types in parallel
      const searchPromises = accessibleTypes.map(type =>
        queryOntologyByType(type, searchQuery, { ontologyRid, maxResults: Math.ceil(maxResults / accessibleTypes.length) })
          .catch(err => {
            if (err.message && err.message.includes('PERMISSION_DENIED')) {
              console.log(`  [DENIED] ${type} - caching for future requests`);
              deniedObjectTypes.add(type);
            } else {
              console.warn(`  [ERROR] ${type}: ${err.message?.slice(0, 100)}`);
            }
            return { data: [], totalCount: 0, searchedType: type };
          })
      );

      const results = await Promise.all(searchPromises);

      // Combine results from all types
      const allData = results.flatMap(r => r.data || []);
      const totalCount = results.reduce((sum, r) => sum + (r.totalCount || 0), 0);
      const successfulTypes = accessibleTypes.filter((type, i) =>
        (results[i].data?.length || 0) > 0
      );

      console.log(`Found ${allData.length} total results from ${successfulTypes.length} types`);

      return {
        data: allData.slice(0, maxResults),
        totalCount,
        searchedTypes: successfulTypes.length > 0 ? successfulTypes : accessibleTypes,
      };
    }

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
      const allObjectTypes = await listObjectTypes(ontologyRid);

      if (allObjectTypes.length === 0) {
        console.warn('No object types found in ontology');
        return { data: [], totalCount: 0 };
      }

      // Filter out types we've already been denied access to
      const accessibleTypes = allObjectTypes.filter(type => !deniedObjectTypes.has(type));

      console.log(`Found ${allObjectTypes.length} object types (${deniedObjectTypes.size} denied), ${accessibleTypes.length} accessible`);

      // Rank types by relevance to the search query
      const rankedTypes = rankObjectTypesByRelevance(accessibleTypes, searchQuery);

      // Log the ranking for debugging
      const topRanked = rankedTypes.slice(0, 10).map(t => {
        const score = scoreTypeRelevance(t, searchQuery);
        return `${t}(${score})`;
      });
      console.log(`Top ranked types for "${searchQuery.slice(0, 50)}...": ${topRanked.join(', ')}`);

      // Search ALL types with non-zero relevance score, or top 15 if many have scores
      const typesToSearch = rankedTypes.filter(type => {
        const score = scoreTypeRelevance(type, searchQuery);
        return score > 0;
      });

      // If no types scored, fall back to top 10 types
      const finalTypesToSearch = typesToSearch.length > 0
        ? typesToSearch.slice(0, 15) // Cap at 15 to avoid too many parallel requests
        : rankedTypes.slice(0, 10);

      console.log(`Searching ${finalTypesToSearch.length} relevant types...`);

      // Search in parallel with error handling
      const searchPromises = finalTypesToSearch.map(type =>
        queryOntologyByType(type, searchQuery, { ontologyRid, maxResults: 5 })
          .catch(err => {
            // Check if it's a permission denied error
            if (err.message && err.message.includes('PERMISSION_DENIED')) {
              console.log(`  [DENIED] ${type} - caching for future requests`);
              deniedObjectTypes.add(type);
            } else {
              console.warn(`  [ERROR] ${type}: ${err.message?.slice(0, 100)}`);
            }
            return { data: [], totalCount: 0, searchedType: type };
          })
      );

      const results = await Promise.all(searchPromises);

      // Combine results from all types, filtering out empty results
      const allData = results.flatMap(r => r.data || []);
      const totalCount = results.reduce((sum, r) => sum + (r.totalCount || 0), 0);
      const successfulTypes = finalTypesToSearch.filter((type, i) =>
        (results[i].data?.length || 0) > 0
      );

      console.log(`Found ${allData.length} total results from ${successfulTypes.length} types`);

      return {
        data: allData.slice(0, maxResults),
        totalCount,
        searchedTypes: successfulTypes.length > 0 ? successfulTypes : finalTypesToSearch,
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
 * Uses caching to avoid repeated API calls
 */
export async function getObjectTypeSchema(
  objectType: string,
  ontologyRid?: string
): Promise<FoundryObjectSchema> {
  const rid = ontologyRid || await getOntologyRid();

  if (!rid) {
    throw new Error('FOUNDRY_ONTOLOGY_RID not configured');
  }

  // Check cache first
  const cacheKey = `${rid}:${objectType}`;
  const cached = schemaCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < SCHEMA_CACHE_TTL) {
    return cached.schema;
  }

  const endpoint = `/api/v1/ontologies/${rid}/objectTypes/${objectType}`;

  try {
    const response = await callFoundryAPI(endpoint, {
      method: 'GET',
    }) as FoundryObjectSchema;

    // Cache the result
    schemaCache.set(cacheKey, { schema: response, timestamp: Date.now() });

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
