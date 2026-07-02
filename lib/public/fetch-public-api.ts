export const PUBLIC_API_REVALIDATE_SECONDS = 60;

function getInternalApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://127.0.0.1:3001";
}

type PublicApiResponse<T> = {
  data: T;
};

type FetchPublicApiOptions = {
  tags?: string[];
};

export async function fetchPublicApi<T>(
  path: string,
  options?: FetchPublicApiOptions,
): Promise<T | null> {
  try {
    const response = await fetch(`${getInternalApiBaseUrl()}${path}`, {
      next: {
        revalidate: PUBLIC_API_REVALIDATE_SECONDS,
        ...(options?.tags ? { tags: options.tags } : {}),
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as PublicApiResponse<T>;
    return payload.data;
  } catch {
    return null;
  }
}
