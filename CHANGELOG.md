# Changelog

## 1.3.0 - 2026-04-12

### Added
- Actor and NPC conversation support alongside player-to-player chats.
- A lightweight friend-request flow for actor messaging.
- Separate actor chat storage and GM moderation views.
- Ready-to-use macros for actor friendship and direct actor chat access.

### Changed
- Split actor conversations out of private user chats for cleaner persistence and moderation.
- Added a shared conversation lookup helper to reduce branching across the data layer.
- Persisted conversation `lastActivity` so hub ordering stays stable after reloads.

### Fixed
- Actor recipients now resolve correctly so accepted characters can actually receive messages.
- GM moderation clear/delete actions now target the correct conversation type.
- Circular imports in the data layer were removed.

### Notes
- Verified against Foundry VTT v11 through v13 compatibility paths.
