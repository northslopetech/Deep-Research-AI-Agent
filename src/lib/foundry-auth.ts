/**
 * Foundry Authentication Module
 *
 * Supports two authentication modes:
 * 1. Static Token (local dev): Uses FOUNDRY_TOKEN environment variable
 * 2. Client Credentials (Foundry Compute Module): Uses CLIENT_ID/CLIENT_SECRET
 *    injected by Foundry to fetch a token via OAuth2
 */

// Logger that won't be stripped
const log = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [foundry-auth] ${message}`;
  if (data !== undefined) {
    console.info(logMessage, typeof data === 'string' ? data : JSON.stringify(data));
  } else {
    console.info(logMessage);
  }
};

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
  log("getAuthToken called");

  // Check for static token first (local development)
  const staticToken = process.env.FOUNDRY_TOKEN;
  if (staticToken) {
    log("Using static FOUNDRY_TOKEN", { tokenLength: staticToken.length });
    return staticToken;
  }

  // Check for cached token
  if (tokenCache && tokenCache.expiresAt > Date.now() + TOKEN_REFRESH_BUFFER_MS) {
    log("Using cached token", { expiresAt: new Date(tokenCache.expiresAt).toISOString() });
    return tokenCache.token;
  }

  // Fetch token using client credentials (Foundry Compute Module mode)
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const baseUrl = process.env.FOUNDRY_BASE_URL;

  log("Checking OAuth credentials", {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    hasBaseUrl: !!baseUrl,
    baseUrl: baseUrl || "NOT SET",
  });

  if (!clientId || !clientSecret) {
    const error = 'Authentication failed: Neither FOUNDRY_TOKEN nor CLIENT_ID/CLIENT_SECRET are set.';
    log("ERROR: " + error);
    throw new Error(error);
  }

  if (!baseUrl) {
    const error = 'FOUNDRY_BASE_URL is required for authentication';
    log("ERROR: " + error);
    throw new Error(error);
  }

  const tokenUrl = `${baseUrl}/multipass/api/oauth2/token`;
  log("Fetching OAuth token", { tokenUrl });

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

    log("OAuth response received", { status: response.status, ok: response.ok });

    if (!response.ok) {
      const errorText = await response.text();
      log("OAuth request failed", { status: response.status, errorText });
      throw new Error(
        `OAuth token request failed (${response.status}): ${errorText}`
      );
    }

    const tokenData = await response.json();
    log("OAuth token data received", {
      hasAccessToken: !!tokenData.access_token,
      expiresIn: tokenData.expires_in,
    });

    if (!tokenData.access_token) {
      throw new Error('OAuth response missing access_token');
    }

    // Cache the token
    const expiresInMs = (tokenData.expires_in || 3600) * 1000;
    tokenCache = {
      token: tokenData.access_token,
      expiresAt: Date.now() + expiresInMs,
    };

    log("OAuth token cached successfully", {
      tokenLength: tokenCache.token.length,
      expiresAt: new Date(tokenCache.expiresAt).toISOString(),
    });
    return tokenCache.token;

  } catch (error: any) {
    log("ERROR in OAuth flow", { message: error?.message, stack: error?.stack });
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
