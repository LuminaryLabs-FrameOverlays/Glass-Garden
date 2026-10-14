# Glass Garden

Glass Garden (OV-064) is a local, software-only plant collection. Create small procedural plant studies from a seed, choose a species silhouette and pot, adjust simulated growth, arrange plants, and save or duplicate a collection. The plants are stylized generated graphics; growth is a user-controlled simulation and makes no botanical accuracy claims.

## Requirements and start

Requires Node.js 22+. FrameFactory is consumed as source from the clean checkout at `a01fedaedd6cf0ea5df84fa710db0caf8c6e8aec`. In this workspace it is at `../../2026-10-13/task/FrameFactory`; set `FRAMEFACTORY_ROOT` to another clean checkout at that exact commit when needed. No npm packages or external accounts are required.

```sh
npm test
npm run verify
npm run proof:mock
npm run build
npm run dev
```

Open the loopback URL printed by `npm run dev` (default port 4177; set `PORT` to change it). Projects are stored locally under `.local/projects`; set `GARDEN_STORAGE_ROOT` to choose another directory. No app launch or visual validation has been performed in this build task.

## Use

Create a named collection, add a plant with a numeric seed, species silhouette and pot, then use **Advance simulated growth** to move it through five illustrative stages. Edit the selected plant, arrange the collection, undo or redo, and save. The project shelf reopens saved collections; duplicate creates a separate unsaved project. Import and export use bounded project JSON. Unsaved changes are shown and guarded before replacing the collection or leaving the page where the browser supports that prompt.

## Limits and evidence

Collections hold at most 24 plants; each plant has a 32-bit unsigned seed and a bounded plant type, pot, growth stage and layout position. Saved files and requests are limited to 1 MiB, histories to 100 changes, projects to 100, and active sessions to 16. Generated plant features are deterministic from seed and settings. Geometry and RGBA previews are derived data and are not persisted.

The local host composes the real FrameFactory runtime, action/state/history/persistence/render/surface Kits and **mock provider**. Garden's renderer submits plant pixels through FrameFactory into that provider; the browser preview displays those submitted bytes. This proves local software composition only. Runtime behavior and visual quality are **unverified**; smoke tests and source audits do not prove the full experience. No real overlay provider, Nexus engine, headset, installer or release is claimed.

## Build evidence (2026-10-14)

- `npm test` — **PASS**, 8/8 non-UI smoke tests.
- `npm run verify` — **PASS**, JavaScript syntax, FrameFactory frame validation, source wiring and lifecycle/persistence audit; no app server started.
- `npm run proof:mock` — **PASS**, simulated provider accepted Garden's 480×320 RGBA surface (614,400 bytes); save/reopen passed.
- `npm run build` — **PASS**, runnable source package under ignored `dist/`; no external packages, installer, native binary or release produced.
- `git diff --check` — **PASS**.

These checks do not establish full runtime behavior or visual quality. The browser app, server restart journey, real provider, Nexus engine and headset remain unverified.

See [architecture](docs/architecture.md), [project storage](docs/storage.md), [validation evidence](docs/validation.md) and [.agent/build-journal.md](.agent/build-journal.md).
