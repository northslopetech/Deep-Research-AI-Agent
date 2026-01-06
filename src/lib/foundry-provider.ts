import { createFoundry } from '@northslopetech/foundry-ai-sdk';
import { getAuthToken } from './foundry-auth';

/**
 * Foundry AI Provider
 *
 * Creates a Foundry provider instance with dynamic authentication.
 * For synchronous access (model initialization), we create a lazy provider
 * that uses the static token if available. For Compute Module mode,
 * use getFoundryProvider() which handles async token fetching.
 */

// Lazy provider for synchronous usage (uses static token or cached token)
// This works because the token is fetched once and cached in foundry-auth.ts
export const foundry = createFoundry({
  foundryToken: process.env.FOUNDRY_TOKEN,
  baseURL: process.env.FOUNDRY_BASE_URL,
});

/**
 * Create a Foundry provider with a fresh token.
 * Use this in contexts where async initialization is acceptable.
 * Returns the same foundry function interface.
 */
export async function getFoundryProvider() {
  const token = await getAuthToken();
  return createFoundry({
    foundryToken: token,
    baseURL: process.env.FOUNDRY_BASE_URL,
  });
}

/**
 * Helper to ensure a valid token is available before using the provider.
 * Call this at the start of long-running operations in Compute Module mode.
 */
export async function ensureAuthenticated(): Promise<void> {
  await getAuthToken();
}
