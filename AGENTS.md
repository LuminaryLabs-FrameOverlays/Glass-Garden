# Glass Garden working contract

- Read README.md, `.agent/start-here.md` and docs before changing the app.
- Keep app-specific generation, growth and collection semantics in `kits/glass-garden-domain-kit/`.
- Use the pinned FrameFactory source checkout and actual runtime plugin/surface/render/provider contracts. Never modify the shared checkout or claim the mock is a real overlay.
- Project records contain only bounded serializable data. Validate a complete project before state replacement or save. Preserve corrupt files and the previous good save on failure.
- Close all sessions and timers; enforce per-session limits and serialize storage writes.
- Validation authorized for this batch is limited to build/type checks, lightweight smoke tests and source audits. Do not launch the application, start a preview server, run browser automation, capture screenshots or do visual/app-run checks.
- Accepted local checks: `npm test` (8/8 PASS), `npm run verify` (PASS), `npm run proof:mock` (PASS, simulated provider), `npm run build` (PASS), and `git diff --check` (PASS). Commands and evidence are recorded in README.md, `docs/validation.md` and `.agent/build-journal.md`.
- Runtime behavior and visual quality must remain marked unverified.
- Do not push, publish, edit the tracker or change other repositories.
