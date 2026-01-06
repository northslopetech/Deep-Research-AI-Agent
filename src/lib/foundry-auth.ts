/**
 * Foundry Authentication Module
 *
 * Supports two authentication modes:
 * 1. Static Token (local dev): Uses FOUNDRY_TOKEN environment variable
 * 2. Client Credentials (Foundry Compute Module): Uses CLIENT_ID/CLIENT_SECRET
 *    injected by Foundry to fetch a token via OAuth2
 */

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

// Buffer time before expiry to refresh token (5 minutes)
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

/**
 * Get an authentication token for Foundry API calls.
 *
 * Priority:
 * 1. If FOUNDRY_TOKEN is set (local dev), use it directly
 * 2. If CLIENT_ID and CLIENT_SECRET are set (Foundry Compute Module),
 *    use OAuth2 client credentials flow to obtain a token
 */
export async function getAuthToken(): Promise<string> {
  // Check for static token first (local development)
  const staticToken = process.env.FOUNDRY_TOKEN;
  if (staticToken) {
    return staticToken;
  }

  // Check for cached token
  if (tokenCache && tokenCache.expiresAt > Date.now() + TOKEN_REFRESH_BUFFER_MS) {
    return tokenCache.token;
  }

  // Fetch token using client credentials (Foundry Compute Module mode)
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const baseUrl = process.env.FOUNDRY_BASE_URL;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Authentication failed: Neither FOUNDRY_TOKEN nor CLIENT_ID/CLIENT_SECRET are set. ' +
      'Set FOUNDRY_TOKEN for local development or ensure CLIENT_ID/CLIENT_SECRET are injected by Foundry.'
    );
  }

  if (!baseUrl) {
    throw new Error('FOUNDRY_BASE_URL is required for authentication');
  }

  const tokenUrl = `${baseUrl}/multipass/api/oauth2/token`;

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OAuth token request failed (${response.status}): ${errorText}`
      );
    }

    const tokenData = await response.json();

    if (!tokenData.access_token) {
      throw new Error('OAuth response missing access_token');
    }

    // Cache the token
    // expires_in is in seconds, default to 1 hour if not provided
    const expiresInMs = (tokenData.expires_in || 3600) * 1000;
    tokenCache = {
      token: tokenData.access_token,
      expiresAt: Date.now() + expiresInMs,
    };

    console.log('[foundry-auth] Successfully obtained OAuth token');
    return tokenCache.token;

  } catch (error) {
    console.error('[foundry-auth] Failed to obtain OAuth token:', error);
    throw error;
  }
}

/**
 * Check if authentication is available (either static or client credentials)
 */
export function isAuthConfigured(): boolean {
  return !!(
    process.env.FOUNDRY_TOKEN ||
    (process.env.CLIENT_ID && process.env.CLIENT_SECRET)
  );
}

/**
 * Clear the token cache (useful for testing or forced refresh)
 */
export function clearTokenCache(): void {
  tokenCache = null;
}
