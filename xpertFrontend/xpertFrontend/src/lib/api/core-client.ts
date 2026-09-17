import { env } from "@/lib/api/env";
import type { ApiError } from "@/types/api.types";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown; // We accept a plain object/array here and JSON.stringify it ourselves
  timeoutMs?: number;
}

/**
 * TODO(auth): once auth strategy is decided, inject the header here —
 * e.g. `Authorization: Bearer ${getAccessToken()}` for a token scheme,
 * or drop this entirely if the browser sends a session cookie automatically
 * (in which case add `credentials: "include"` to the fetch call below instead).
 * Every request funnels through this one function, so activating auth
 * later is a one-line change here — no component needs to change.
 */
let refreshPromise: Promise<string | null> | null = null;

function refreshAccessToken(refreshToken: string): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${env.apiUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.tenantId ? { "X-Tenant-ID": env.tenantId } : {}),
      },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (refreshResponse) => {
        if (!refreshResponse.ok) return null;

        const envelope: {
          success?: boolean;
          data?: { accessToken?: string; refreshToken?: string };
        } = await refreshResponse.json();
        const data = envelope.data;
        if (!data?.accessToken) return null;

        localStorage.setItem("access_token", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refresh_token", data.refreshToken);
        }
        return data.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function buildHeaders(customHeaders?: HeadersInit, forceToken?: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Safe check for SSR environments
  if (typeof window !== "undefined") {
    const token = forceToken || localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  if (env.tenantId) {
    headers["X-Tenant-ID"] = env.tenantId;
  }

  // Merge custom headers (which might override Content-Type or add others)
  if (customHeaders) {
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => (headers[key] = value));
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, value]) => (headers[key] = value));
    } else {
      Object.assign(headers, customHeaders);
    }
  }

  return headers;
}

/**
 * Base request function for the CORE backend (jobs, candidates, CVs, and AI).
 * Every *.service.ts function for these domains calls this — never
 * `fetch()` directly — so retry/error/auth logic lives in exactly one place.
 */
async function coreRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, timeoutMs, ...rest } = options;

  let timeoutId: NodeJS.Timeout | undefined;
  const controller = new AbortController();
  
  if (timeoutMs) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }

  const performRequest = async (tokenOverride?: string) => {
    return fetch(`${env.apiUrl}${path}`, {
      ...rest,
      headers: buildHeaders(headers, tokenOverride),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: timeoutMs ? controller.signal : rest.signal,
    });
  };

  try {
    let response = await performRequest();

    if (response.status === 401 && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        const newToken = await refreshAccessToken(refreshToken);

        if (newToken) {
          response = await performRequest(newToken); // Retry the original request
        } else {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }

    if (!response.ok) {
      const errorPayload: Partial<ApiError> = await response
        .json()
        .catch(() => ({}));

      throw {
        status: response.status,
        message: errorPayload.message ?? `Core API request failed: ${response.status}`,
      } satisfies ApiError;
    }

    // Handle 204 No Content (e.g. DELETE) — nothing to parse
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw {
        status: 408,
        message: "Service request timed out. Please try again.",
      } satisfies ApiError;
    }
    throw err;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/**
 * Separate from coreRequest() on purpose: file uploads use FormData,
 * which must NOT have a manually-set Content-Type header — the browser
 * sets it automatically with the correct multipart boundary string.
 * Reusing buildHeaders() (which always injects "application/json") would
 * silently corrupt every upload request.
 */
async function coreUpload<T>(path: string, formData: FormData): Promise<T> {
  const performUpload = (token?: string) => {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (env.tenantId) {
      headers["X-Tenant-ID"] = env.tenantId;
    }
    return fetch(`${env.apiUrl}${path}`, { method: "POST", headers, body: formData });
  };

  let token = typeof window !== "undefined" ? localStorage.getItem("access_token") ?? undefined : undefined;
  let response = await performUpload(token);

  if (response.status === 401 && typeof window !== "undefined") {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      const newToken = await refreshAccessToken(refreshToken);
      if (newToken) {
        token = newToken;
        response = await performUpload(token);
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }
  }

  if (!response.ok) {
    const errorPayload: Partial<ApiError> = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      message: errorPayload.message ?? `Upload failed: ${response.status}`,
    } satisfies ApiError;
  }

  return response.json() as Promise<T>;
}

async function coreDownloadBlob(path: string): Promise<{ blob: Blob; filename: string | null }> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (env.tenantId) {
    headers["X-Tenant-ID"] = env.tenantId;
  }
  
  const response = await fetch(`${env.apiUrl}${path}`, { headers });
  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`);
  }

  let filename = null;
  const disposition = response.headers.get("Content-Disposition");
  if (disposition && disposition.indexOf("attachment") !== -1) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, "");
    }
  }

  return { blob: await response.blob(), filename };
}

export const coreClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    coreRequest<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    coreRequest<T>(path, { ...options, method: "POST", body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    coreRequest<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    coreRequest<T>(path, { ...options, method: "DELETE" }),

  upload: <T>(path: string, formData: FormData) => coreUpload<T>(path, formData),

  downloadBlob: (path: string) => coreDownloadBlob(path),
};