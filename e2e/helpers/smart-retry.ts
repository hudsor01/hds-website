import { Page } from '@playwright/test';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: Error) => boolean;
  beforeRetry?: (attempt: number, error: Error) => Promise<void>;
  onFinalFailure?: (error: Error, attempts: number) => Promise<void>;
}

export interface NetworkRetryOptions extends RetryOptions {
  timeoutErrors?: boolean;
  connectionErrors?: boolean;
  serverErrors?: boolean;
  rateLimitErrors?: boolean;
}

export class SmartRetry {
  private static defaultOptions: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryCondition: () => true
  };

  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const config = { ...this.defaultOptions, ...options };
    let lastError: Error;
    
    for (let attempt = 0; attempt <= config.maxRetries!; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Check if we should retry this error
        if (!config.retryCondition!(lastError) || attempt === config.maxRetries) {
          if (config.onFinalFailure) {
            await config.onFinalFailure(lastError, attempt + 1);
          }
          throw lastError;
        }
        
        // Execute before retry hook
        if (config.beforeRetry) {
          await config.beforeRetry(attempt + 1, lastError);
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay! * Math.pow(config.backoffFactor!, attempt),
          config.maxDelay!
        );
        
        console.log(`Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms. Error: ${lastError.message}`);
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }

  static async withNetworkRetry<T>(
    operation: () => Promise<T>,
    options: NetworkRetryOptions = {}
  ): Promise<T> {
    const networkOptions: RetryOptions = {
      ...options,
      retryCondition: (error: Error) => {
        const errorMessage = error.message.toLowerCase();
        
        // Check for specific network error types
        if (options.timeoutErrors && this.isTimeoutError(error)) return true;
        if (options.connectionErrors && this.isConnectionError(error)) return true;
        if (options.serverErrors && this.isServerError(error)) return true;
        if (options.rateLimitErrors && this.isRateLimitError(error)) return true;
        
        // Default network error detection
        return this.isNetworkError(error);
      },
      beforeRetry: async (attempt: number, error: Error) => {
        console.log(`Network retry ${attempt}: ${error.message}`);
        if (options.beforeRetry) {
          await options.beforeRetry(attempt, error);
        }
      }
    };
    
    return this.withRetry(operation, networkOptions);
  }

  static async withPageRetry<T>(
    page: Page,
    operation: (page: Page) => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    return this.withRetry(async () => {
      try {
        return await operation(page);
      } catch (error) {
        // Check if page is closed or context is destroyed
        if (this.isPageError(error as Error)) {
          console.log('Page error detected, attempting to recover...');
          // Don't retry page errors as they usually indicate test setup issues
          throw error;
        }
        throw error;
      }
    }, options);
  }

  static async waitForCondition(
    condition: () => Promise<boolean>,
    options: {
      timeout?: number;
      interval?: number;
      timeoutMessage?: string;
    } = {}
  ): Promise<void> {
    const { timeout = 30000, interval = 1000, timeoutMessage = 'Condition not met within timeout' } = options;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await this.sleep(interval);
    }
    
    throw new Error(timeoutMessage);
  }

  static async waitForStableValue<T>(
    getValue: () => Promise<T>,
    options: {
      timeout?: number;
      stabilityDuration?: number;
      interval?: number;
      tolerance?: (a: T, b: T) => boolean;
    } = {}
  ): Promise<T> {
    const {
      timeout = 30000,
      stabilityDuration = 2000,
      interval = 500,
      tolerance = (a, b) => a === b
    } = options;
    
    const startTime = Date.now();
    let lastValue: T;
    let stableStartTime: number | null = null;
    
    while (Date.now() - startTime < timeout) {
      const currentValue = await getValue();
      
      if (lastValue !== undefined && tolerance(currentValue, lastValue)) {
        if (stableStartTime === null) {
          stableStartTime = Date.now();
        } else if (Date.now() - stableStartTime >= stabilityDuration) {
          return currentValue;
        }
      } else {
        stableStartTime = null;
      }
      
      lastValue = currentValue;
      await this.sleep(interval);
    }
    
    throw new Error('Value did not stabilize within timeout');
  }

  // Error type detection methods
  static isNetworkError(error: Error): boolean {
    const message = error.message.toLowerCase();
    const networkKeywords = [
      'network',
      'connection',
      'timeout',
      'refused',
      'reset',
      'unreachable',
      'dns',
      'fetch'
    ];
    
    return networkKeywords.some(keyword => message.includes(keyword));
  }

  static isTimeoutError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('timeout') || message.includes('timed out');
  }

  static isConnectionError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('connection') || 
           message.includes('refused') || 
           message.includes('reset') ||
           message.includes('unreachable');
  }

  static isServerError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('server error') ||
           message.includes('500') ||
           message.includes('502') ||
           message.includes('503') ||
           message.includes('504');
  }

  static isRateLimitError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('rate limit') ||
           message.includes('too many requests') ||
           message.includes('429');
  }

  static isPageError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('page is closed') ||
           message.includes('context is closed') ||
           message.includes('browser has been closed');
  }

  static isFlakeError(error: Error): boolean {
    // Common flaky error patterns
    const flakyPatterns = [
      'element not found',
      'not visible',
      'not clickable',
      'stale element',
      'element is not attached',
      'element not interactable'
    ];
    
    const message = error.message.toLowerCase();
    return flakyPatterns.some(pattern => message.includes(pattern));
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Retry decorators for common operations
export class RetryableOperations {
  static async click(page: Page, selector: string, options: RetryOptions = {}): Promise<void> {
    return SmartRetry.withRetry(async () => {
      const element = page.locator(selector);
      await element.waitFor({ state: 'visible' });
      await element.click();
    }, {
      maxRetries: 3,
      retryCondition: SmartRetry.isFlakeError,
      ...options
    });
  }

  static async fill(page: Page, selector: string, value: string, options: RetryOptions = {}): Promise<void> {
    return SmartRetry.withRetry(async () => {
      const element = page.locator(selector);
      await element.waitFor({ state: 'visible' });
      await element.clear();
      await element.fill(value);
      
      // Verify the value was set
      const actualValue = await element.inputValue();
      if (actualValue !== value) {
        throw new Error(`Failed to fill field. Expected: ${value}, Actual: ${actualValue}`);
      }
    }, {
      maxRetries: 3,
      retryCondition: SmartRetry.isFlakeError,
      ...options
    });
  }

  static async waitForSelector(page: Page, selector: string, options: RetryOptions = {}): Promise<void> {
    return SmartRetry.withRetry(async () => {
      await page.waitForSelector(selector, { timeout: 10000 });
    }, {
      maxRetries: 3,
      retryCondition: SmartRetry.isTimeoutError,
      ...options
    });
  }

  static async waitForNavigation(page: Page, trigger: () => Promise<void>, options: RetryOptions = {}): Promise<void> {
    return SmartRetry.withRetry(async () => {
      await Promise.all([
        page.waitForLoadState('networkidle', { timeout: 30000 }),
        trigger()
      ]);
    }, {
      maxRetries: 2,
      retryCondition: (error) => SmartRetry.isTimeoutError(error) || SmartRetry.isNetworkError(error),
      ...options
    });
  }

  static async expectWithRetry(
    assertion: () => Promise<void>,
    options: RetryOptions = {}
  ): Promise<void> {
    return SmartRetry.withRetry(assertion, {
      maxRetries: 5,
      baseDelay: 500,
      maxDelay: 5000,
      retryCondition: (error) => {
        // Retry on assertion errors
        return error.message.includes('expect') || 
               error.message.includes('received') ||
               SmartRetry.isFlakeError(error);
      },
      ...options
    });
  }

  static async apiCall<T>(
    request: () => Promise<T>,
    options: NetworkRetryOptions = {}
  ): Promise<T> {
    return SmartRetry.withNetworkRetry(request, {
      maxRetries: 3,
      baseDelay: 1000,
      timeoutErrors: true,
      connectionErrors: true,
      serverErrors: true,
      rateLimitErrors: true,
      beforeRetry: async (attempt, error) => {
        if (SmartRetry.isRateLimitError(error)) {
          // Wait longer for rate limit errors
          await SmartRetry.sleep(attempt * 5000);
        }
      },
      ...options
    });
  }

  static async formSubmission(
    page: Page,
    submitAction: () => Promise<void>,
    options: RetryOptions = {}
  ): Promise<void> {
    return SmartRetry.withRetry(async () => {
      // Wait for form to be ready
      await page.waitForLoadState('domcontentloaded');
      
      // Execute submit action
      await submitAction();
      
      // Wait for response or navigation
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    }, {
      maxRetries: 3,
      retryCondition: (error) => {
        return SmartRetry.isNetworkError(error) || 
               SmartRetry.isTimeoutError(error) ||
               error.message.includes('form');
      },
      beforeRetry: async (attempt) => {
        console.log(`Retrying form submission, attempt ${attempt}`);
        // Refresh page before retry
        await page.reload({ waitUntil: 'domcontentloaded' });
      },
      ...options
    });
  }

  static async stableScreenshot(
    page: Page,
    options: { path?: string; fullPage?: boolean } = {}
  ): Promise<Buffer> {
    return SmartRetry.withRetry(async () => {
      // Wait for animations to complete
      await page.waitForLoadState('networkidle');
      await SmartRetry.sleep(1000);
      
      // Take screenshot
      const screenshot = await page.screenshot({
        fullPage: true,
        ...options
      });
      
      return screenshot;
    }, {
      maxRetries: 3,
      baseDelay: 1000
    });
  }
}

// Circuit breaker pattern for repeated failures
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private maxFailures = 5,
    private timeoutMs = 60000,
    private resetTimeoutMs = 30000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime < this.resetTimeoutMs) {
        throw new Error('Circuit breaker is open');
      }
      this.state = 'half-open';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.maxFailures) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.failures = 0;
    this.state = 'closed';
    this.lastFailureTime = 0;
  }
}