// Twitter card image reuses the Open Graph card generator. Route config
// (runtime/dynamic/size/etc.) must be declared DIRECTLY here, not re-exported:
// Next.js cannot statically analyze a re-exported `runtime` and silently falls
// back to the default runtime, which breaks the Node-only readFileSync logo
// load in opengraph-image. Only the rendering component is re-exported.
export { default } from './opengraph-image'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const alt = 'Hudson Digital Solutions'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
