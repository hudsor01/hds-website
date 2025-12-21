// tests/integration/error-logging.test.ts
import { describe, it, expect } from 'bun:test'
import { generateFingerprint } from '@/lib/logger'

describe('Error Logging Integration', () => {
  describe('Fingerprint Generation', () => {
    it('generates consistent fingerprint for identical errors', () => {
      const error1 = {
        type: 'TypeError',
        message: 'Cannot read property x of undefined',
        stack: `Error: Cannot read property x
    at processData (src/lib/data.ts:45:12)
    at handler (src/app/api/route.ts:23:5)`
      }

      const fp1 = generateFingerprint(error1.type, error1.message, error1.stack)
      const fp2 = generateFingerprint(error1.type, error1.message, error1.stack)

      expect(fp1).toBe(fp2)
      expect(fp1.length).toBeGreaterThan(0)
    })

    it('generates different fingerprints for different errors', () => {
      const fp1 = generateFingerprint(
        'TypeError',
        'Cannot read x',
        'at foo (a.ts:1)'
      )
      const fp2 = generateFingerprint(
        'ReferenceError',
        'x is not defined',
        'at bar (b.ts:2)'
      )

      expect(fp1).not.toBe(fp2)
    })

    it('uses first stack frame for fingerprinting', () => {
      const stack1 = `Error: Test
    at commonFrame (shared.ts:10)
    at differentCaller1 (a.ts:5)`

      const stack2 = `Error: Test
    at commonFrame (shared.ts:10)
    at differentCaller2 (b.ts:8)`

      const fp1 = generateFingerprint('Error', 'Test', stack1)
      const fp2 = generateFingerprint('Error', 'Test', stack2)

      // Same first frame = same fingerprint
      expect(fp1).toBe(fp2)
    })
  })
})
