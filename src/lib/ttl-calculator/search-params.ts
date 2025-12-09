import { createSearchParamsCache, parseAsString } from 'nuqs/server'

// Parser for the share code URL parameter (?c=ABC123XY)
export const shareCodeParser = {
  c: parseAsString,
}

// Server-side cache for loading search params
export const loadSearchParams = createSearchParamsCache(shareCodeParser)
