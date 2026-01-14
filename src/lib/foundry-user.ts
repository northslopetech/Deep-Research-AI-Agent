/**
 * Foundry user resolution helper.
 *
 * We intentionally do NOT normalize or transform the returned username.
 * We simply pick the first available value from known headers/env vars.
 */

import { createClient } from '@osdk/client';
import { Admin } from '@osdk/foundry';
import { getAuthToken } from './foundry-auth';
import { getOntologyRid } from './foundry-client';

const HEADER_CANDIDATES = [
  // Common reverse-proxy / identity headers
  "x-forwarded-user",
  "x-authenticated-user",
  "x-authenticated-userid",
  "x-remote-user",
  "remote-user",
  "x-user",
  "x-username",
  "x-user-name",
  "x-user-email",

  // Likely Foundry / Palantir-specific headers (varies by deployment)
  "x-foundry-user",
  "x-foundry-username",
  "x-foundry-user-email",
  "x-foundry-userid",
  "x-palantir-user",
  "x-palantir-username",
  "x-palantir-user-email",
  "x-multipass-user",
  "x-multipass-username",
  "x-multipass-user-id",
  "x-multipass-subject",
] as const;

const ENV_CANDIDATES = [
  // Foundry / Palantir-style
  "FOUNDRY_USERNAME",
  "FOUNDRY_USER",
  "FOUNDRY_USER_ID",
  "PALANTIR_USERNAME",
  "PALANTIR_USER",

  // Generic but sometimes set in hosted runtimes
  "USER_EMAIL",
  "EMAIL",
  "USERNAME",
] as const;

function firstNonEmpty(values: Array<string | null | undefined>): string | undefined {
  for (const v of values) {
    if (typeof v === "string" && v.length > 0) return v;
  }
  return undefined;
}

export function resolveFoundryUserFromRequest(req: Request): string | undefined {
  const values = HEADER_CANDIDATES.map((h) => req.headers.get(h));
  return firstNonEmpty(values);
}

export function resolveFoundryUserFromEnv(): string | undefined {
  const values = ENV_CANDIDATES.map((k) => process.env[k]);
  return firstNonEmpty(values);
}

export function resolveFoundryUser(req?: Request): string | undefined {
  if (req) {
    const fromReq = resolveFoundryUserFromRequest(req);
    if (fromReq) return fromReq;
  }
  return resolveFoundryUserFromEnv();
}

// Best-effort startup debug: log the service/current user once when the module loads.
// This is helpful to quickly see what identity we get in this runtime.
void (async () => {
  const startupUser = await getCurrentFoundryUser();
  console.log('[foundry-user] Startup resolved user (service/local token):', startupUser ?? 'null');
})();

/**
 * Fetch the Foundry user via Admin API using the current auth token.
 * Returns null on error. Note: when using service credentials, this will
 * return the service user, not the end user.
 */
export async function getCurrentFoundryUser(): Promise<string | null> {
  try {
    const foundryUrl = process.env.FOUNDRY_BASE_URL;
    const ontologyRid = await getOntologyRid();

    if (!foundryUrl || !ontologyRid) {
      return null;
    }

    const token = await getAuthToken();
    const client = createClient(foundryUrl, ontologyRid, async () => token);
    const user = await Admin.Users.getCurrent(
      client as Parameters<typeof Admin.Users.getCurrent>[0]
    );

    // Return as-is (no normalization). Prefer stable id, then username.
    return user.id ?? user.username ?? null;
  } catch (error) {
    console.warn('[foundry-user] Failed to get current user via Admin API:', error);
    return null;
  }
}

/**
 * Async resolver: headers/env first, then Admin API, else "anonymous".
 */
export async function resolveFoundryUserAsync(req?: Request | null): Promise<string> {
  const immediate = resolveFoundryUser(req || undefined);
  if (immediate) return immediate;

  const apiUser = await getCurrentFoundryUser();
  if (apiUser) {
    console.log('[foundry-user] Resolved user via Admin API:', apiUser);
    return apiUser;
  }

  return 'anonymous';
}
