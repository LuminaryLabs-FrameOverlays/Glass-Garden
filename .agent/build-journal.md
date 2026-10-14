# Build journal

| Failure | Cause | Fix | Recheck |
| --- | --- | --- | --- |
| Initial `git clone` in the assigned workspace failed with `Operation not permitted` creating `.git`. | Workspace command was sandboxed; clone needed network/filesystem escalation for the already-authorized existing repository. | Retried the same clone with the approved elevated command after clearing only the probe file created during diagnosis. | Clone completed; `main` is at `8339820741e86eba0889746404cd2bd185cd7ff8`, clean against `origin/main`. |
| First `npm test` run had 7/8 passing: the 24-plant rejection text did not match the test's `/at most 24/` expectation. | The product limit worked; the message said "This collection already has 24 plants" without stating the maximum. | Clarified the app error as "A collection can contain at most 24 plants." | `npm test` rerun passed 8/8. |

## Final command record — 2026-10-14 (Node v25.8.1)

| Command | Result |
| --- | --- |
| `npm test` | PASS — 8 tests, 0 failures; deterministic generation, bounds, growth, arrangement pixels, malformed data, save failure preservation, reopen, duplication/isolation, undo/redo, provider submission and teardown. |
| `npm run verify` | PASS — JavaScript syntax, frame contract, actual pinned FrameFactory import and source audit of plugin/render/provider wiring, atomic persistence, corrupt-save reporting and cleanup. App server was not started. |
| `npm run proof:mock` | PASS — simulated mock provider received 480×320 RGBA / 614,400 bytes through `surface.garden`; save/reopen passed. |
| `npm run build` | PASS — runnable source package emitted to ignored `dist/`; FrameFactory pin confirmed, no external packages/native binary/release. |
| `git diff --check` | PASS — no whitespace errors. |
| `git status --short --branch` | `## main...origin/main`; local implementation files remain uncommitted; no push. |

FrameFactory remains at `a01fedaedd6cf0ea5df84fa710db0caf8c6e8aec` with clean tracked state. Only its source was imported. Runtime behavior and visual quality remain **unverified**; no browser, preview server, screenshot, app journey or server-process restart was run. A new storage-adapter instance reopened files in the non-UI smoke tests; this is not full server restart proof.

## Evidence policy

Only source audits and non-UI smoke/build checks are in scope for this task. Runtime behavior and visual quality remain **unverified**. Tests do not establish the complete user experience.
