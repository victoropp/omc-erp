import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures to trigger circuit opening
  recoveryTimeout: number; // Time to wait before trying half-open state (ms)
  monitoringWindow: number; // Time window for monitoring failures (ms)
  slowCallDurationThreshold: number; // Duration considered as slow call (ms)
  slowCallRateThreshold: number; // Percentage of slow calls to trigger opening
  minimumNumberOfCalls: number; // Minimum calls in window before evaluation
  successThreshold: number; // Number of successful calls to close circuit in half-open
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  slowCallCount: number;
  totalCalls: number;
  lastFailureTime: Date | null;
  lastSuccessTime: Date | null;
  nextAttempt: Date | null;
  failureRate: number;
  slowCallRate: number;
}

export class CircuitBreaker extends EventEmitter {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: Date[] = [];
  private successes: Date[] = [];
  private slowCalls: Date[] = [];
  private lastFailureTime: Date | null = null;
  private lastSuccessTime: Date | null = null;
  private nextAttempt: Date | null = null;
  private halfOpenSuccessCount = 0;

  constructor(
    private readonly name: string,
    private readonly options: CircuitBreakerOptions,
    private readonly logger: Logger
  ) {
    super();
    this.logger.log(`Circuit breaker ${name} initialized with options:`, options);
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.logger.log(`Circuit breaker ${this.name} moved to HALF_OPEN state`);
        this.emit('stateChange', { name: this.name, state: this.state });
      } else {
        const error = new Error(`Circuit breaker ${this.name} is OPEN`);
        (error as any).isCircuitBreakerOpen = true;
        throw error;
      }
    }

    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.onSuccess(duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.onFailure(duration);
      throw error;
    }
  }

  private onSuccess(duration: number): void {
    const now = new Date();
    
    if (duration > this.options.slowCallDurationThreshold) {
      this.slowCalls.push(now);
    }
    
    this.successes.push(now);
    this.lastSuccessTime = now;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenSuccessCount++;
      
      if (this.halfOpenSuccessCount >= this.options.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.halfOpenSuccessCount = 0;
        this.failures = [];
        this.slowCalls = [];
        this.logger.log(`Circuit breaker ${this.name} moved to CLOSED state`);
        this.emit('stateChange', { name: this.name, state: this.state });
      }
    }
    
    this.cleanupOldRecords();
  }

  private onFailure(duration: number): void {
    const now = new Date();
    
    this.failures.push(now);
    this.lastFailureTime = now;
    
    if (duration > this.options.slowCallDurationThreshold) {
      this.slowCalls.push(now);
    }
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = new Date(Date.now() + this.options.recoveryTimeout);
      this.halfOpenSuccessCount = 0;
      this.logger.warn(`Circuit breaker ${this.name} moved to OPEN state from HALF_OPEN`);
      this.emit('stateChange', { name: this.name, state: this.state });
    } else if (this.state === CircuitState.CLOSED && this.shouldOpenCircuit()) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = new Date(Date.now() + this.options.recoveryTimeout);
      this.logger.warn(`Circuit breaker ${this.name} moved to OPEN state`);
      this.emit('stateChange', { name: this.name, state: this.state });
    }
    
    this.cleanupOldRecords();
  }

  private shouldOpenCircuit(): boolean {
    const now = Date.now();
    const windowStart = now - this.options.monitoringWindow;
    
    const recentFailures = this.failures.filter(f => f.getTime() > windowStart);
    const recentSuccesses = this.successes.filter(s => s.getTime() > windowStart);
    const recentSlowCalls = this.slowCalls.filter(s => s.getTime() > windowStart);
    const totalRecentCalls = recentFailures.length + recentSuccesses.length;
    
    if (totalRecentCalls < this.options.minimumNumberOfCalls) {
      return false;
    }
    
    const failureRate = (recentFailures.length / totalRecentCalls) * 100;
    const slowCallRate = totalRecentCalls > 0 ? (recentSlowCalls.length / totalRecentCalls) * 100 : 0;
    
    return (
      failureRate >= this.options.failureThreshold ||
      slowCallRate >= this.options.slowCallRateThreshold
    );
  }

  private shouldAttemptReset(): boolean {
    return this.nextAttempt && Date.now() >= this.nextAttempt.getTime();
  }

  private cleanupOldRecords(): void {
    const now = Date.now();
    const cutoff = now - this.options.monitoringWindow;
    
    this.failures = this.failures.filter(f => f.getTime() > cutoff);
    this.successes = this.successes.filter(s => s.getTime() > cutoff);
    this.slowCalls = this.slowCalls.filter(s => s.getTime() > cutoff);
  }

  getStats(): CircuitBreakerStats {
    const now = Date.now();
    const windowStart = now - this.options.monitoringWindow;
    
    const recentFailures = this.failures.filter(f => f.getTime() > windowStart);
    const recentSuccesses = this.successes.filter(s => s.getTime() > windowStart);
    const recentSlowCalls = this.slowCalls.filter(s => s.getTime() > windowStart);
    const totalRecentCalls = recentFailures.length + recentSuccesses.length;
    
    return {
      state: this.state,
      failureCount: recentFailures.length,
      successCount: recentSuccesses.length,
      slowCallCount: recentSlowCalls.length,
      totalCalls: totalRecentCalls,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      nextAttempt: this.nextAttempt,
      failureRate: totalRecentCalls > 0 ? (recentFailures.length / totalRecentCalls) * 100 : 0,
      slowCallRate: totalRecentCalls > 0 ? (recentSlowCalls.length / totalRecentCalls) * 100 : 0,
    };
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = [];
    this.successes = [];
    this.slowCalls = [];
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.nextAttempt = null;
    this.halfOpenSuccessCount = 0;
    
    this.logger.log(`Circuit breaker ${this.name} has been reset`);
    this.emit('stateChange', { name: this.name, state: this.state });
  }

  forceOpen(): void {
    this.state = CircuitState.OPEN;
    this.nextAttempt = new Date(Date.now() + this.options.recoveryTimeout);
    
    this.logger.log(`Circuit breaker ${this.name} forced to OPEN state`);
    this.emit('stateChange', { name: this.name, state: this.state });
  }

  forceClose(): void {
    this.state = CircuitState.CLOSED;
    this.failures = [];
    this.slowCalls = [];
    this.nextAttempt = null;
    this.halfOpenSuccessCount = 0;
    
    this.logger.log(`Circuit breaker ${this.name} forced to CLOSED state`);
    this.emit('stateChange', { name: this.name, state: this.state });
  }
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private circuitBreakers = new Map<string, CircuitBreaker>();
  
  private readonly defaultOptions: CircuitBreakerOptions = {
    failureThreshold: 50, // 50% failure rate
    recoveryTimeout: 60000, // 1 minute
    monitoringWindow: 60000, // 1 minute window
    slowCallDurationThreshold: 5000, // 5 seconds
    slowCallRateThreshold: 50, // 50% slow call rate
    minimumNumberOfCalls: 10, // At least 10 calls
    successThreshold: 3, // 3 successful calls to close
  };

  getCircuitBreaker(
    name: string, 
    options: Partial<CircuitBreakerOptions> = {}
  ): CircuitBreaker {
    if (!this.circuitBreakers.has(name)) {
      const finalOptions = { ...this.defaultOptions, ...options };
      const circuitBreaker = new CircuitBreaker(name, finalOptions, this.logger);
      
      // Add event listeners for monitoring
      circuitBreaker.on('stateChange', (event) => {
        this.logger.log(`Circuit breaker state changed: ${event.name} -> ${event.state}`);
      });
      
      this.circuitBreakers.set(name, circuitBreaker);
    }
    
    return this.circuitBreakers.get(name)!;
  }

  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    
    for (const [name, circuitBreaker] of this.circuitBreakers) {
      stats[name] = circuitBreaker.getStats();
    }
    
    return stats;
  }

  resetAll(): void {
    for (const circuitBreaker of this.circuitBreakers.values()) {
      circuitBreaker.reset();
    }
  }

  resetCircuitBreaker(name: string): boolean {
    const circuitBreaker = this.circuitBreakers.get(name);
    if (circuitBreaker) {
      circuitBreaker.reset();
      return true;
    }
    return false;
  }

  removeCircuitBreaker(name: string): boolean {
    return this.circuitBreakers.delete(name);
  }

  // Health check for circuit breakers
  getHealthStatus(): {
    healthy: string[];
    degraded: string[];
    unhealthy: string[];
    total: number;
  } {
    const healthy: string[] = [];
    const degraded: string[] = [];
    const unhealthy: string[] = [];

    for (const [name, circuitBreaker] of this.circuitBreakers) {
      const stats = circuitBreaker.getStats();
      
      if (stats.state === CircuitState.OPEN) {
        unhealthy.push(name);
      } else if (stats.state === CircuitState.HALF_OPEN || stats.failureRate > 25) {
        degraded.push(name);
      } else {
        healthy.push(name);
      }
    }

    return {
      healthy,
      degraded,
      unhealthy,
      total: this.circuitBreakers.size,
    };
  }
}

/**
 * Circuit breaker decorator
 */
export function CircuitBreakerProtected(
  circuitBreakerName: string,
  options: Partial<CircuitBreakerOptions> = {}
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const circuitBreakerService: CircuitBreakerService = 
        this.circuitBreakerService || this.circuitBreaker;
      
      if (!circuitBreakerService) {
        // Fallback to original method if circuit breaker service is not available
        return originalMethod.apply(this, args);
      }
      
      const circuitBreaker = circuitBreakerService.getCircuitBreaker(
        circuitBreakerName,
        options
      );
      
      return circuitBreaker.execute(() => originalMethod.apply(this, args));
    };
    
    return descriptor;
  };
}