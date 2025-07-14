// Purpose: TypeScript module declaration for Vue SFCs to ensure default export typing for .vue files in production builds (e.g., Vercel).
// Assumptions: All .vue files export a Vue component as default.

declare module '*.vue' {
    import { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}
