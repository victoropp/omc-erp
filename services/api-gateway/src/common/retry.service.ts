import { Injectable, Logger } from '@nestjs/common';

export interface RetryOptions {
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear' | 'random';
  baseDelay: number; // Base delay in milliseconds
  maxDelay: number; // Maximum delay in milliseconds
  jitter: boolean; // Add randomness to delay
  retryCondition?: (error: any) => boolean; // Custom condition to determine if retry should occur
  onRetry?: (attempt: number, error: any) => void; // Callback on retry
}

export interface RetryAttempt {
  attempt: number;
  error: any;
  delay: number;
  timestamp: Date;
}

export interface RetryStats {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  averageAttempts: number;
  lastRetryTime: Date | null;
  recentAttempts: RetryAttempt[];
}

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);
  private stats = new Map<string, RetryStats>();

  private readonly defaultOptions: RetryOptions = {
    maxAttempts: 3,
    backoffStrategy: 'exponential',
    baseDelay: 1000,
    maxDelay: 30000,
    jitter: true,
    retryCondition: this.defaultRetryCondition,
  };

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {},
    operationName: string = 'unknown'
  ): Promise<T> {
    const finalOptions = { ...this.defaultOptions, ...options };
    const attempts: RetryAttempt[] = [];
    let lastError: any;

    for (let attempt = 1; attempt <= finalOptions.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        // Record successful attempt
        this.recordSuccess(operationName, attempt, attempts);
        
        if (attempt > 1) {
          this.logger.log(
            `Operation ${operationName} succeeded on attempt ${attempt}/${finalOptions.maxAttempts}`
          );
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Check if we should retry this error
        if (!finalOptions.retryCondition!(error)) {
          this.logger.warn(
            `Operation ${operationName} failed with non-retryable error:`,
            error.message
          );
          this.recordFailure(operationName, attempt, attempts);
          throw error;
        }

        // If this is the last attempt, don't wait
        if (attempt === finalOptions.maxAttempts) {
          this.recordFailure(operationName, attempt, attempts);
          break;
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, finalOptions);
        
        const retryAttempt: RetryAttempt = {
          attempt,
          error,
          delay,
          timestamp: new Date(),
        };
        
        attempts.push(retryAttempt);

        this.logger.warn(
          `Operation ${operationName} failed on attempt ${attempt}/${finalOptions.maxAttempts}. ` +
          `Retrying in ${delay}ms. Error: ${error.message}`
        );

        // Call onRetry callback if provided
        if (finalOptions.onRetry) {
          finalOptions.onRetry(attempt, error);
        }

        // Wait before next attempt
        await this.delay(delay);
      }
    }

    // All attempts failed
    this.logger.error(
      `Operation ${operationName} failed after ${finalOptions.maxAttempts} attempts`
    );
    
    throw lastError;
  }

  private calculateDelay(attempt: number, options: RetryOptions): number {
    let delay: number;

    switch (options.backoffStrategy) {
      case 'fixed':
        delay = options.baseDelay;
        break;
      
      case 'linear':
        delay = options.baseDelay * attempt;
        break;
      
      case 'exponential':
        delay = options.baseDelay * Math.pow(2, attempt - 1);
        break;
      
      case 'random':
        delay = Math.random() * options.baseDelay * attempt;
        break;
      
      default:
        delay = options.baseDelay;
    }

    // Apply jitter if enabled
    if (options.jitter) {
      const jitterRange = delay * 0.1; // 10% jitter
      delay += (Math.random() - 0.5) * 2 * jitterRange;
    }

    // Ensure delay doesn't exceed maximum
    return Math.min(delay, options.maxDelay);
  }

  private defaultRetryCondition(error: any): boolean {
    // Don't retry client errors (4xx), but retry server errors (5xx) and network errors
    if (error.response) {
      const status = error.response.status;
      return status >= 500 || status === 408 || status === 429; // Server errors, timeout, rate limit
    }
    
    // Retry network errors, timeouts, and connection issues
    if (error.code) {
      const retryableCodes = [
        'ECONNRESET',
        'ECONNREFUSED',
        'ETIMEDOUT',
        'EHOSTUNREACH',
        'ENETDOWN',
        'ENETUNREACH',
        'ENOTFOUND',
      ];
      return retryableCodes.includes(error.code);
    }

    // Retry circuit breaker open errors
    if (error.isCircuitBreakerOpen) {
      return true;
    }

    return false;
  }

  private recordSuccess(operationName: string, attempts: number, attemptHistory: RetryAttempt[]): void {
    if (!this.stats.has(operationName)) {
      this.stats.set(operationName, {
        totalAttempts: 0,
        successfulAttempts: 0,
        failedAttempts: 0,
        averageAttempts: 0,
        lastRetryTime: null,
        recentAttempts: [],
      });
    }

    const stats = this.stats.get(operationName)!;
    stats.totalAttempts += attempts;
    stats.successfulAttempts++;
    stats.averageAttempts = stats.totalAttempts / stats.successfulAttempts;
    
    if (attemptHistory.length > 0) {
      stats.lastRetryTime = attemptHistory[attemptHistory.length - 1].timestamp;
      stats.recentAttempts.push(...attemptHistory);
      
      // Keep only last 100 attempts
      if (stats.recentAttempts.length > 100) {
        stats.recentAttempts = stats.recentAttempts.slice(-100);
      }
    }
  }

  private recordFailure(operationName: string, attempts: number, attemptHistory: RetryAttempt[]): void {
    if (!this.stats.has(operationName)) {
      this.stats.set(operationName, {
        totalAttempts: 0,
        successfulAttempts: 0,
        failedAttempts: 0,
        averageAttempts: 0,
        lastRetryTime: null,
        recentAttempts: [],
      });
    }

    const stats = this.stats.get(operationName)!;
    stats.totalAttempts += attempts;
    stats.failedAttempts++;
    
    if (attemptHistory.length > 0) {
      stats.lastRetryTime = attemptHistory[attemptHistory.length - 1].timestamp;
      stats.recentAttempts.push(...attemptHistory);
      
      // Keep only last 100 attempts
      if (stats.recentAttempts.length > 100) {
        stats.recentAttempts = stats.recentAttempts.slice(-100);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats(operationName?: string): Record<string, RetryStats> | RetryStats | null {
    if (operationName) {
      return this.stats.get(operationName) || null;
    }
    
    const allStats: Record<string, RetryStats> = {};
    for (const [name, stats] of this.stats) {
      allStats[name] = stats;
    }
    
    return allStats;
  }

  resetStats(operationName?: string): void {
    if (operationName) {
      this.stats.delete(operationName);
    } else {
      this.stats.clear();
    }
  }

  // Bulk retry for multiple operations
  async retryAll<T>(
    operations: Array<{
      name: string;
      operation: () => Promise<T>;
      options?: Partial<RetryOptions>;
    }>
  ): Promise<Array<{ name: string; result?: T; error?: any }>> {
    const results = await Promise.allSettled(
      operations.map(async ({ name, operation, options }) => {
        try {
          const result = await this.executeWithRetry(operation, options, name);
          return { name, result };
        } catch (error) {
          return { name, error };
        }
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: operations[index].name,
          error: result.reason,
        };
      }
    });
  }

  // Circuit breaker integration
  async executeWithRetryAndCircuitBreaker<T>(
    operation: () => Promise<T>,
    retryOptions: Partial<RetryOptions> = {},
    circuitBreakerName: string,
    operationName: string = 'unknown'
  ): Promise<T> {
    // This method assumes circuit breaker service is injected
    // Implementation would integrate with CircuitBreakerService
    return this.executeWithRetry(operation, retryOptions, operationName);
  }
}

/**
 * Retry decorator
 */
export function Retryable(
  options: Partial<RetryOptions> = {},
  operationName?: string
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const name = operationName || `${target.constructor.name}.${propertyName}`;
    
    descriptor.value = async function (...args: any[]) {
      const retryService: RetryService = this.retryService || this.retry;
      
      if (!retryService) {
        // Fallback to original method if retry service is not available
        return originalMethod.apply(this, args);
      }
      
      return retryService.executeWithRetry(
        () => originalMethod.apply(this, args),
        options,
        name
      );
    };
    
    return descriptor;
  };
}

/**
 * Combined circuit breaker and retry decorator
 */
export function ResilientCall(
  retryOptions: Partial<RetryOptions> = {},
  circuitBreakerName?: string,
  operationName?: string
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const name = operationName || `${target.constructor.name}.${propertyName}`;
    
    descriptor.value = async function (...args: any[]) {
      const retryService: RetryService = this.retryService || this.retry;
      const circuitBreakerService = this.circuitBreakerService || this.circuitBreaker;
      
      if (!retryService) {
        return originalMethod.apply(this, args);
      }
      
      const operation = circuitBreakerName && circuitBreakerService
        ? () => {
            const circuitBreaker = circuitBreakerService.getCircuitBreaker(circuitBreakerName);
            return circuitBreaker.execute(() => originalMethod.apply(this, args));
          }
        : () => originalMethod.apply(this, args);
      
      return retryService.executeWithRetry(operation, retryOptions, name);
    };
    
    return descriptor;
  };
}

/**
 * Timeout decorator with retry support
 */
export function TimeoutWithRetry(
  timeoutMs: number,
  retryOptions: Partial<RetryOptions> = {}
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const name = `${target.constructor.name}.${propertyName}`;
    
    descriptor.value = async function (...args: any[]) {
      const retryService: RetryService = this.retryService || this.retry;
      
      const timeoutOperation = () => {
        return Promise.race([
          originalMethod.apply(this, args),
          new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error(`Operation ${name} timed out after ${timeoutMs}ms`));
            }, timeoutMs);
          }),
        ]);
      };
      
      if (retryService) {
        return retryService.executeWithRetry(timeoutOperation, retryOptions, name);
      } else {
        return timeoutOperation();
      }
    };
    
    return descriptor;
  };
}