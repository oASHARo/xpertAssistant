
/**
 * Single source of truth for reading env vars. NEXT_PUBLIC_ vars must be
 * accessed as static `process.env.NEXT_PUBLIC_X` (not bracket notation
 * with a dynamic key) — Next.js/Turbopack can only inline NEXT_PUBLIC_
 * values into the client bundle when it can statically see the exact
 * property access at build time.
 */
const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

function assertEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Check .env.local (see .env.example for the expected keys).`
    );
  }
  return value;
}

export const env = {
  /** When true, every *.service.ts function returns mock-store.ts data instead of hitting a real backend. */
  useMockData,

  /**
   * Only required when NOT using mock data — no point forcing you to
   * configure real backend URLs just to preview the UI against fixtures.
   */
  apiUrl: useMockData ? "" : assertEnv(process.env.NEXT_PUBLIC_CORE_API_URL, "NEXT_PUBLIC_CORE_API_URL"),
  tenantId: useMockData ? undefined : assertEnv(process.env.NEXT_PUBLIC_TENANT_ID, "NEXT_PUBLIC_TENANT_ID"),
} as const;
