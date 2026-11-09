// Registers happy-dom globals in its own preload, listed first in bunfig.toml,
// so `document` exists before tests/setup.ts imports @testing-library/jest-dom.
// jest-dom 7 pulls in @testing-library/dom, whose `screen` binds to
// document.body at import time; ESM hoisting means a register() call inside
// setup.ts would run too late. Pattern from https://bun.com/docs/test/dom.
import { GlobalRegistrator } from '@happy-dom/global-registrator'
// Load next/server while Request/Headers are still Bun's native classes.
// NextRequest extends the global Request at module load, and happy-dom's
// browser-mode Request drops forbidden headers (Origin, Referer, Host) that
// the proxy and same-origin tests depend on.
import 'next/server'

GlobalRegistrator.register()
