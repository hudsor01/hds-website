/**
 * Converts any error-like value to a proper Error instance.
 * Handles Error objects, strings, objects with message property, and unknown values.
 */
export function castError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === 'string') {
    return new Error(error)
  }

  // Handle objects with a message property
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return new Error((error as { message: string }).message)
  }

  // For null, undefined, or other primitives, use String()
  // For objects without message, try JSON.stringify
  if (typeof error === 'object' && error !== null) {
    try {
      return new Error(JSON.stringify(error))
    } catch {
      return new Error('Unknown error')
    }
  }

  return new Error(String(error))
}
