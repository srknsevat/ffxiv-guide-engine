export type ExecuteWithRetryInput<TValue> = Readonly<{
  operation: () => Promise<TValue>;
  retries: number;
  baseDelayMs: number;
}>;

async function waitForDelay(delayMs: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

/**
 * Retries an async operation with linear backoff.
 */
export async function executeWithRetry<TValue>(
  input: ExecuteWithRetryInput<TValue>
): Promise<TValue> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= input.retries; attempt += 1) {
    try {
      return await input.operation();
    } catch (err) {
      lastError = err;
      const hasRemainingAttempts = attempt < input.retries;
      if (!hasRemainingAttempts) {
        break;
      }
      const delay = input.baseDelayMs * (attempt + 1);
      await waitForDelay(delay);
    }
  }
  throw lastError;
}
