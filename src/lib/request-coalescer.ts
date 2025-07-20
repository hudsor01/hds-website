// Request coalescing to reduce cold starts
class RequestCoalescer {
  private inflightRequests = new Map<string, Promise<unknown>>();
  
  async coalesce<T>(
    key: string, 
    fetcher: () => Promise<T>
  ): Promise<T> {
    // If request is already in flight, return the same promise
    const existing = this.inflightRequests.get(key);
    if (existing) return existing as Promise<T>;
    
    // Create new request and store promise
    const promise = fetcher()
      .finally(() => {
        // Clean up after completion
        this.inflightRequests.delete(key);
      });
    
    this.inflightRequests.set(key, promise);
    return promise;
  }
}

export const coalescer = new RequestCoalescer();

// Usage example:
// const result = await coalescer.coalesce('contact-form', async () => {
//   return fetch('/api/contact', { method: 'POST', body });
// });