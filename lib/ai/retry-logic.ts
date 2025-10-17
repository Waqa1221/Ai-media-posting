import { AI_CONFIG } from "./config";

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

class RetryHandler {
  private static instance: RetryHandler;

  static getInstance(): RetryHandler {
    if (!RetryHandler.instance) {
      RetryHandler.instance = new RetryHandler();
    }
    return RetryHandler.instance;
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = AI_CONFIG.limits.maxRetries,
      baseDelay = 1000,
      maxDelay = 30000,
      backoffFactor = 2,
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          break;
        }

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, attempt),
          maxDelay
        );

        console.warn(
          `Attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
          error
        );
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private isRetryableError(error: any): boolean {
    // Rate limit errors
    if (error?.status === 429) return true;

    // Server errors
    if (error?.status >= 500) return true;

    // Network errors
    if (error?.code === "ECONNRESET" || error?.code === "ETIMEDOUT")
      return true;

    // OpenAI specific errors
    if (error?.type === "server_error") return true;

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async withFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    try {
      return await this.withRetry(primaryOperation, options);
    } catch (primaryError) {
      console.warn("Primary operation failed, trying fallback:", primaryError);

      try {
        return await this.withRetry(fallbackOperation, options);
      } catch (fallbackError) {
        console.error("Both primary and fallback operations failed");
        const primaryMessage =
          primaryError instanceof Error
            ? primaryError.message
            : String(primaryError);
        const fallbackMessage =
          fallbackError instanceof Error
            ? fallbackError.message
            : String(fallbackError);
        throw new Error(
          `Primary: ${primaryMessage}, Fallback: ${fallbackMessage}`
        );
      }
    }
  }
}

export const retryHandler = RetryHandler.getInstance();
