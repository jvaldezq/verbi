export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 'exponential',
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        break;
      }

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      const waitTime = calculateDelay(delay, attempt, backoff);
      await sleep(waitTime);
    }
  }

  throw lastError!;
}

function calculateDelay(
  baseDelay: number,
  attempt: number,
  backoff: 'linear' | 'exponential'
): number {
  if (backoff === 'exponential') {
    return baseDelay * Math.pow(2, attempt - 1);
  }
  return baseDelay * attempt;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class RetryableError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean = true,
    public readonly retryAfter?: number
  ) {
    super(message);
    this.name = 'RetryableError';
  }
}