// Twitter card image reuses the Open Graph card generator. Image metadata
// (alt/size/contentType) is declared DIRECTLY here, not re-exported, so Next.js
// can statically analyze it. Only the rendering component and the
// static-params generator are re-exported.
export { default, generateStaticParams } from './opengraph-image'

export const alt = 'Hudson Digital Solutions'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
