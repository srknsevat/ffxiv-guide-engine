export type FetchTextWithTimeoutInput = Readonly<{
  url: string;
  timeoutMs: number;
  headers?: Readonly<Record<string, string>>;
}>;

/**
 * Performs HTTP GET with timeout and returns text response.
 */
export async function fetchTextWithTimeout(input: FetchTextWithTimeoutInput): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, input.timeoutMs);
  try {
    const response = await fetch(input.url, {
      method: "GET",
      headers: input.headers,
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`Request failed (${response.status}) for ${input.url}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}
