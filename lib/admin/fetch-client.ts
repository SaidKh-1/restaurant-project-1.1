"use client";

type CacheEntry = {
  expiresAt: number;
  data: unknown;
};

export type AdminFetchJsonResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  fromCache: boolean;
};

const DEFAULT_TTL_MS = 30_000;
const cache = new Map<string, CacheEntry>();

export function invalidateAdminCache(urlPrefix?: string) {
  if (!urlPrefix) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.startsWith(urlPrefix)) {
      cache.delete(key);
    }
  }
}

export async function adminFetchJson<T>(
  url: string,
  options?: { force?: boolean; ttlMs?: number },
): Promise<AdminFetchJsonResult<T>> {
  const force = options?.force ?? false;
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  const now = Date.now();

  if (!force) {
    const cached = cache.get(url);

    if (cached && cached.expiresAt > now) {
      return {
        ok: true,
        status: 200,
        data: cached.data as T,
        fromCache: true,
      };
    }
  }

  const response = await fetch(url, { credentials: "include" });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data: null,
      fromCache: false,
    };
  }

  const data = (await response.json()) as T;
  cache.set(url, {
    expiresAt: now + ttlMs,
    data,
  });

  return {
    ok: true,
    status: response.status,
    data,
    fromCache: false,
  };
}

export async function adminGet<T>(
  url: string,
  options?: { force?: boolean; errorMessage?: string },
): Promise<T> {
  const result = await adminFetchJson<{ data: T }>(url, options);

  if (!result.ok || !result.data) {
    throw new Error(options?.errorMessage ?? "تعذر تحميل البيانات.");
  }

  return result.data.data;
}

export async function adminMutateJson<T>(
  url: string,
  init: RequestInit,
  invalidateUrls?: readonly string[],
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
  });

  if (invalidateUrls?.length) {
    for (const invalidateUrl of new Set(invalidateUrls)) {
      invalidateAdminCache(invalidateUrl);
    }
  }

  let data: T | null = null;

  if (response.ok) {
    try {
      data = (await response.json()) as T;
    } catch {
      data = null;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}
