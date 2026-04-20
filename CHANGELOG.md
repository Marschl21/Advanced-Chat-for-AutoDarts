# Changelog

## [1.0.0] – 2026-04-20

### Added
- Persistent chat history panel injected above quick-message buttons
- Card-style messages with avatar, coloured username, and timestamp
- Per-match/lobby history stored by UUID — new match = fresh history
- Shared history between `/lobbies/<id>` and `/matches/<id>` with same UUID
- Auto-scroll to latest message
- Clear button to wipe history
- Duplicate suppression (same message within 2 seconds is ignored)
- WebSocket hook in MAIN world for reliable message capture
