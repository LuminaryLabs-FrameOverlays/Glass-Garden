# Architecture and rendering path

```text
Browser controls -> localhost semantic actions -> FrameFactory createFrameRuntime
                                                    -> Glass Garden plugin
                                                    -> state/history/persistence Kits
                                                    -> app-owned plant model and pixel renderer
                                                    -> FrameFactory render/surface Kits -> mock provider RGBA texture
Browser canvas <- /proof bytes from the same mock-provider texture
```

`adapters/framefactory.js` checks the exact clean FrameFactory source revision, imports the real `createFrameRuntime`, mock provider and frame validator, then validates `frame/frame.json`. The plugin registers garden and project actions and a `surface.garden` renderer. FrameFactory passes its 480×320 RGBA texture through its surface Kit to the mock provider. The browser canvas gets bytes back from that provider's texture. There is no second product renderer beside the provider surface.

Product rules live in `kits/glass-garden-domain-kit/`: `contracts.js` owns input and serialization limits; `plants.js` owns deterministic seeded foliage and simulated growth; `texture.js` produces bounded pixels. Project data stores names, seeds, choices, stage and arrangement only. The geometry and pixel texture are regenerated from those saved values. The server owns session isolation, request validation, local storage and abandoned-session cleanup. Sessions have no growth timer; each growth action advances one explicit simulated stage.

No reusable FrameFactory change was needed. Factory source/dependency layout is the actual source checkout, not a copied package: `src/runtime/frame-runtime.mjs`, `adapters/mock/index.mjs`, `src/frame/validation/index.mjs`, and Kits under `kits/presentation`, `kits/persistence`, `kits/state`, `kits/history`, and `kits/actions`. The checkout is pinned at `a01fedaedd6cf0ea5df84fa710db0caf8c6e8aec`, version 0.6.0. It has no app installation requirement; this app has no external npm dependencies.
