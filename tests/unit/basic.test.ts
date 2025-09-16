import { describe, it, expect } from 'vitest'

describe('Basic Tests', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    expect('Hello World').toContain('World')
  })
})