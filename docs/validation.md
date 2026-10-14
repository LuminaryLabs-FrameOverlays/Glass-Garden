# Validation evidence

This batch explicitly limits acceptance to source audits, build/type checks and lightweight non-UI smoke tests. Do not launch the application, start a preview server, use browser automation, capture screenshots or perform visual/app-run checks.

The smoke suite covers deterministic seeds, silhouette differentiation, input and collection bounds, growth stages, arrangement pixels, malformed data, atomic save and reopening through a fresh storage adapter, failed-save preservation, FrameFactory mock texture submission, duplicate-session isolation and teardown. A storage adapter recreation is a persistence/restart smoke check; it does not prove a real server-process restart journey.

Commands and results are recorded in [the build journal](../.agent/build-journal.md) and summarized in README.md. A mock provider is simulated software evidence. Runtime behavior and visual quality are **unverified**. These checks do not prove the complete experience, visual quality, browser behavior, a real provider, NexusEngine, native packaging, headset behavior or release readiness.
